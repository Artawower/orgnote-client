import ForceGraph, { type LinkObject, type NodeObject } from 'force-graph';
import type { GraphUiConfig } from 'orgnote-api';
import type { GraphNodeViewModel, GraphViewModel } from 'src/models/graph';
import { getCssVar } from 'src/utils/css-utils';
import type { GraphColorsComposable } from './use-graph-colors';
import { graphConfig } from './graph-config';

type ForceGraphRenderer = ReturnType<ReturnType<typeof ForceGraph>>;
type ForceGraphNode = GraphNodeViewModel & NodeObject;
type ForceGraphData = { nodes: GraphNodeViewModel[]; links: LinkObject[] };
type D3ForceAccessor = (name: string, force?: unknown) => { strength?: (v: number) => unknown } | undefined;

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
  getHighlightedSet: () => Set<string>;
  getSelectedNodeId: () => string | undefined;
  onNodeClick: (node: GraphNodeViewModel) => void;
  onNodeHover: (nodeId?: string) => void;
  onBackgroundClick: () => void;
}

const truncateLabel = (value: string): string =>
  value.length <= graphConfig.labelMaxLength
    ? value
    : `${value.slice(0, graphConfig.labelMaxLength - 1)}…`;

export const resolveNodeId = (value: NodeObject | string | number | null | undefined): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value?.id ? String(value.id) : '';
};

const getNodeSize = (node: NodeObject): number =>
  Math.max(1, (node as ForceGraphNode).weight * graphConfig.nodeWeightScaleFactor);



const getRendererSize = (rootEl?: HTMLElement, graphEl?: HTMLElement) => ({
  width: graphEl?.clientWidth ?? rootEl?.clientWidth ?? graphConfig.defaultWidth,
  height: graphEl?.clientHeight ?? rootEl?.clientHeight ?? graphConfig.defaultHeight,
});

export const useGraphRenderer = (opts: UseGraphRendererOptions) => {
  const { colors, getConfig, getHighlightedSet, getSelectedNodeId, onNodeClick, onNodeHover, onBackgroundClick } = opts;

  let renderer: ForceGraphRenderer | undefined;
  let resizeFrameId = 0;

  const paintPointerArea = (node: NodeObject, color: string, ctx: CanvasRenderingContext2D): void => {
    const n = node as ForceGraphNode;
    const r = getConfig().nodeRelSize * Math.sqrt(getNodeSize(node)) + graphConfig.pointerPadding;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(n.x ?? 0, n.y ?? 0, r, 0, 2 * Math.PI);
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
    return colors.nodeColorFor(set.has(nodeId) || getSelectedNodeId() === nodeId, set.size > 0);
  };

  const getEdgeColor = (link: LinkObject): string => {
    const set = getHighlightedSet();
    const isHighlighted = set.has(resolveNodeId(link.source)) && set.has(resolveNodeId(link.target));
    return colors.edgeColorFor(isHighlighted, set.size > 0);
  };

  const drawNodeLabel = (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number): void => {
    const graphNode = node as ForceGraphNode;
    const cfg = getConfig();
    const scaledSize = cfg.labelFontSize / globalScale;
    if (scaledSize > graphConfig.maxLabelScale || graphNode.id === getSelectedNodeId()) return;

    const fontSize = Math.min(cfg.labelFontSize, Math.max(graphConfig.minLabelFontSize, scaledSize));
    ctx.font = `${fontSize}px ${getCssVar('--graph-label-font') ?? 'sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = getCssVar('--graph-label-color') ?? '';
    ctx.fillText(
      truncateLabel(graphNode.label),
      graphNode.x ?? 0,
      (graphNode.y ?? 0) + cfg.nodeRelSize * graphNode.weight + graphConfig.labelOffset,
    );
  };

  const setSize = (rootEl?: HTMLElement, graphEl?: HTMLElement, size?: { width: number; height: number }): void => {
    if (!renderer) return;
    const s = size ?? getRendererSize(rootEl, graphEl);
    if (s.width <= 0 || s.height <= 0) return;
    renderer.width(s.width).height(s.height);
  };

  const syncColors = (): void => {
    renderer?.nodeColor(getNodeColor).linkColor(getEdgeColor);
  };

  const syncData = (graph: GraphViewModel): void => {
    if (!renderer) return;
    renderer.graphData({
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: graph.edges.map((e) => ({ ...e })),
    } as ForceGraphData);
    applyForces(renderer);
    renderer.d3ReheatSimulation();
  };

  const create = (el: HTMLElement): void => {
    if (renderer) return;
    const cfg = getConfig();
    renderer = ForceGraph()(el)
      .nodeRelSize(cfg.nodeRelSize)
      .nodeVal(getNodeSize)
      .zoom(cfg.initialZoom)
      .nodeLabel('')
      .linkColor(getEdgeColor)
      .linkWidth(cfg.linkWidth)
      .nodeId('id')
      .onNodeClick((node) => onNodeClick(node as GraphNodeViewModel))
      .onNodeHover((node) => onNodeHover(resolveNodeId(node)))
      .onBackgroundClick(onBackgroundClick)
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
        create(ctx.graphEl);
        syncColors();
        syncData(ctx.graph);
        setSize(ctx.rootEl, ctx.graphEl);
        return;
      }
      setSize(ctx.rootEl, ctx.graphEl, { width: ctx.width, height: ctx.height });
    });
  };

  const isActive = (): boolean => !!renderer;

  return { create, destroy, syncColors, syncData, setSize, queueResize, isActive };
};
