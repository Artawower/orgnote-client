import ForceGraph, { type LinkObject, type NodeObject } from 'force-graph';
import type { GraphUiConfig } from 'orgnote-api';
import { isNullable } from 'orgnote-api/utils';
import type { GraphEdgeViewModel, GraphNodeViewModel, GraphViewModel } from 'src/models/graph';
import { getCssVar } from 'src/utils/css-utils';
import { graphConfig } from './graph-config';
import type { GraphColorsComposable } from './use-graph-colors';

type ForceGraphRenderer = ReturnType<ReturnType<typeof ForceGraph>>;
type ForceGraphData = { nodes: GraphNodeViewModel[]; links: LinkObject[] };
type TypedNode = GraphNodeViewModel & NodeObject;
type D3ForceAccessor = (
  name: string,
  force?: unknown,
) => { strength?: (v: number) => unknown } | undefined;

export interface ResizeContext {
  width: number;
  height: number;
  shouldRender: boolean;
  rootEl?: HTMLElement;
  graphEl?: HTMLElement;
  graph?: GraphViewModel;
}

export interface UseGraphRendererOptions {
  colors: GraphColorsComposable;
  getConfig: () => GraphUiConfig;
  getDimUnrelated: () => boolean;
  getHighlightedSet: () => Set<string>;
  getSelectedNodeId: () => string | undefined;
  getMaxZoom: () => number | undefined;
  onInitialFitDone?: () => void;
  onNodeClick: (node: GraphNodeViewModel) => void;
  onNodeHover: (nodeId?: string) => void;
  onBackgroundClick: () => void;
}

const truncateLabel = (value: string): string =>
  value.length <= graphConfig.labelMaxLength
    ? value
    : `${value.slice(0, graphConfig.labelMaxLength - 1)}…`;

export const resolveNodeId = (
  value: NodeObject | string | number | null | undefined,
): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value?.id === undefined || isNullable(value.id)) return undefined;
  return String(value.id);
};

const reuseOrCreateNode = (
  node: GraphNodeViewModel,
  existingById: Map<string, TypedNode>,
  added: TypedNode[],
): TypedNode => {
  const prev = existingById.get(node.id);
  if (prev) return Object.assign(prev, node);
  const created = { ...node } as TypedNode;
  added.push(created);
  return created;
};

export const reconcileGraphNodes = (
  current: TypedNode[],
  next: GraphNodeViewModel[],
): { nodes: TypedNode[]; added: TypedNode[] } => {
  const existingById = new Map(current.map((n) => [resolveNodeId(n) ?? '', n] as const));
  const added: TypedNode[] = [];
  const nodes = next.map((n) => reuseOrCreateNode(n, existingById, added));
  return { nodes, added };
};

const findExistingNeighbor = (
  nodeId: string,
  byId: Map<string, TypedNode>,
  edges: GraphEdgeViewModel[],
  addedIds: Set<string>,
): TypedNode | undefined => {
  const edge = edges.find(
    (e) =>
      (e.source === nodeId && !addedIds.has(e.target)) ||
      (e.target === nodeId && !addedIds.has(e.source)),
  );
  if (!edge) return undefined;
  const neighborId = edge.source === nodeId ? edge.target : edge.source;
  return byId.get(neighborId);
};

const jitter = (): number => (Math.random() - 0.5) * graphConfig.newNodeJitter;

const seedAddedPositions = (
  added: TypedNode[],
  nodes: TypedNode[],
  edges: GraphEdgeViewModel[],
): void => {
  if (!added.length) return;
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const addedIds = new Set(added.map((n) => n.id));
  added.forEach((node) => {
    const anchor = findExistingNeighbor(node.id, byId, edges, addedIds);
    if (!anchor) return;
    node.x = (anchor.x ?? 0) + jitter();
    node.y = (anchor.y ?? 0) + jitter();
  });
};

const ZOOM_FIT_FLOOR = 0.15;
const ZOOM_FIT_SCALE = 4;

const estimateInitialZoom = (nodeCount: number): number =>
  nodeCount > 0 ? Math.max(ZOOM_FIT_FLOOR, ZOOM_FIT_SCALE / Math.sqrt(nodeCount)) : ZOOM_FIT_FLOOR;

const getRendererSize = (rootEl?: HTMLElement, graphEl?: HTMLElement) => ({
  width: graphEl?.clientWidth ?? rootEl?.clientWidth ?? graphConfig.defaultWidth,
  height: graphEl?.clientHeight ?? rootEl?.clientHeight ?? graphConfig.defaultHeight,
});

const clampZoomToMax = (
  renderer: ForceGraphRenderer,
  maxZoom: number | undefined,
  duration: number,
): void => {
  if (maxZoom === undefined) return;
  if (renderer.zoom() <= maxZoom) return;
  renderer.zoom(maxZoom, duration);
};

export const useGraphRenderer = (opts: UseGraphRendererOptions) => {
  const {
    colors,
    getConfig,
    getDimUnrelated,
    getHighlightedSet,
    getSelectedNodeId,
    getMaxZoom,
    onInitialFitDone,
    onNodeClick,
    onNodeHover,
    onBackgroundClick,
  } = opts;

  let renderer: ForceGraphRenderer | undefined;
  let currentNodes: TypedNode[] = [];
  let resizeFrameId = 0;
  let hoveredNodeId: string | undefined;
  let zoomToFitTimerId = 0;
  let shouldFitOnEngineStop = false;
  let hasCompletedInitialFit = false;

  const paintPointerArea = (
    node: NodeObject,
    color: string,
    ctx: CanvasRenderingContext2D,
  ): void => {
    const r = getConfig().nodeRelSize + graphConfig.pointerPadding;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
    ctx.fill();
  };

  const applyForces = (r: ForceGraphRenderer): void => {
    const cfg = getConfig();
    const linkForce = r.d3Force('link') as { distance?: (fn: () => number) => void } | undefined;
    linkForce?.distance?.(() => cfg.linkDistance);
    const d3Force = r.d3Force as unknown as D3ForceAccessor;
    d3Force('charge')?.strength?.(cfg.chargeStrength);
    d3Force('center')?.strength?.(graphConfig.centerForceStrength);
  };

  const getNodeColor = (node: NodeObject): string => {
    const nodeId = resolveNodeId(node);
    const set = getHighlightedSet();
    const isActive = (nodeId ? set.has(nodeId) : false) || getSelectedNodeId() === nodeId;
    const hasDim = getDimUnrelated() && set.size > 0;
    return colors.nodeColorFor(isActive, hasDim);
  };

  const getEdgeColor = (link: LinkObject): string => {
    const set = getHighlightedSet();
    const sourceId = resolveNodeId(link.source);
    const targetId = resolveNodeId(link.target);
    const isHighlighted =
      sourceId !== undefined && targetId !== undefined && set.has(sourceId) && set.has(targetId);
    const hasDim = getDimUnrelated() && set.size > 0;
    return colors.edgeColorFor(isHighlighted, hasDim);
  };

  const drawNodeLabel = (
    node: NodeObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ): void => {
    const graphNode = node as TypedNode;
    const nodeId = resolveNodeId(graphNode);
    const isFocused = nodeId === hoveredNodeId || graphNode.id === getSelectedNodeId();

    const cfg = getConfig();
    const scaledFontSize = cfg.labelFontSize * globalScale * 0.8;
    if (!isFocused && scaledFontSize < graphConfig.minLabelFontSize) return;

    const fontSize = Math.min(
      cfg.labelFontSize,
      Math.max(
        graphConfig.minLabelFontSize,
        isFocused ? scaledFontSize : Math.min(scaledFontSize, cfg.labelFontSize),
      ),
    );
    ctx.font = `${fontSize}px ${getCssVar('--graph-label-font') ?? 'sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = getCssVar('--graph-label-color') ?? '';
    ctx.fillText(
      truncateLabel(graphNode.label),
      graphNode.x ?? 0,
      (graphNode.y ?? 0) + cfg.nodeRelSize + graphConfig.labelOffset,
    );
  };

  const setSize = (
    rootEl?: HTMLElement,
    graphEl?: HTMLElement,
    size?: { width: number; height: number },
  ): void => {
    if (!renderer) return;
    const s = size ?? getRendererSize(rootEl, graphEl);
    if (s.width <= 0 || s.height <= 0) return;
    renderer.width(s.width).height(s.height);
  };

  const syncColors = (): void => {
    renderer?.nodeColor(getNodeColor).linkColor(getEdgeColor);
  };

  const applyZoomToFit = (duration: number): void => {
    if (!renderer) return;
    renderer.zoomToFit(duration, graphConfig.zoomToFitPadding);
    clampZoomToMax(renderer, getMaxZoom(), duration);
  };

  const finalizeInitialFit = (): void => {
    if (hasCompletedInitialFit) return;
    hasCompletedInitialFit = true;
    onInitialFitDone?.();
  };

  const runFitToView = (): void => {
    const duration = hasCompletedInitialFit ? graphConfig.zoomToFitDuration : 0;
    applyZoomToFit(duration);
    finalizeInitialFit();
  };

  const syncData = (graph: GraphViewModel, fitToView = false): void => {
    if (!renderer) return;
    window.clearTimeout(zoomToFitTimerId);
    const { nodes, added } = reconcileGraphNodes(currentNodes, graph.nodes);
    seedAddedPositions(added, nodes, graph.edges);
    currentNodes = nodes;
    renderer.graphData({
      nodes,
      links: graph.edges.map((e) => ({ ...e })),
    } as ForceGraphData);
    applyForces(renderer);
    if (added.length) renderer.d3ReheatSimulation();
    if (!fitToView) return;

    shouldFitOnEngineStop = true;
    zoomToFitTimerId = window.setTimeout(() => {
      zoomToFitTimerId = 0;
      if (!shouldFitOnEngineStop) return;
      shouldFitOnEngineStop = false;
      runFitToView();
    }, graphConfig.zoomToFitDelay);
  };

  const create = (el: HTMLElement, nodeCount: number): void => {
    if (renderer) return;
    const cfg = getConfig();
    renderer = ForceGraph()(el)
      .nodeRelSize(cfg.nodeRelSize)
      .zoom(estimateInitialZoom(nodeCount))
      .maxZoom(getMaxZoom() ?? Infinity)
      .nodeLabel('')
      .linkColor(getEdgeColor)
      .linkWidth(cfg.linkWidth)
      .nodeId('id')
      .onNodeClick((node) => onNodeClick(node as GraphNodeViewModel))
      .onNodeHover((node) => {
        hoveredNodeId = resolveNodeId(node);
        onNodeHover(hoveredNodeId);
      })
      .onBackgroundClick(onBackgroundClick)
      .onEngineStop(() => {
        if (!shouldFitOnEngineStop) return;
        shouldFitOnEngineStop = false;
        window.clearTimeout(zoomToFitTimerId);
        zoomToFitTimerId = 0;
        runFitToView();
      })
      .nodeCanvasObjectMode(() => 'before')
      .nodePointerAreaPaint(paintPointerArea)
      .linkDirectionalParticleWidth(graphConfig.particleWidth)
      .nodeColor(getNodeColor)
      .autoPauseRedraw(false)
      .nodeCanvasObject(drawNodeLabel)
      .d3VelocityDecay(cfg.velocityDecay)
      .warmupTicks(cfg.warmupTicks);
  };

  const destroy = (graphEl?: HTMLElement): void => {
    window.cancelAnimationFrame(resizeFrameId);
    resizeFrameId = 0;
    currentNodes = [];
    hoveredNodeId = undefined;
    window.clearTimeout(zoomToFitTimerId);
    zoomToFitTimerId = 0;
    shouldFitOnEngineStop = false;
    hasCompletedInitialFit = false;
    (renderer as ForceGraphRenderer & { _destructor?: () => void })?._destructor?.();
    renderer?.pauseAnimation();
    renderer = undefined;
    graphEl?.replaceChildren();
  };

  const queueResize = (ctx: ResizeContext): void => {
    window.cancelAnimationFrame(resizeFrameId);
    resizeFrameId = window.requestAnimationFrame(() => {
      resizeFrameId = 0;
      if (!ctx.shouldRender) return;
      if (!renderer && ctx.graphEl && ctx.graph) {
        create(ctx.graphEl, ctx.graph?.nodes.length ?? 0);
        syncColors();
        syncData(ctx.graph);
        setSize(ctx.rootEl, ctx.graphEl);
        return;
      }
      setSize(ctx.rootEl, ctx.graphEl, {
        width: ctx.width,
        height: ctx.height,
      });
    });
  };

  const isActive = (): boolean => !!renderer;

  return {
    create,
    destroy,
    syncColors,
    syncData,
    setSize,
    queueResize,
    isActive,
  };
};
