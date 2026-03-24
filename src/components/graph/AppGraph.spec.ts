import { mount } from '@vue/test-utils';
import { beforeEach, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));
import AppGraph from './AppGraph.vue';
import type { GraphViewModel } from 'src/models/graph';
import type { AppGraphProps } from './AppGraph.vue';

type RendererGraphPayload = {
  nodes: GraphViewModel['nodes'];
  links: GraphViewModel['edges'];
};

interface RendererMock {
  nodeRelSize: ReturnType<typeof vi.fn>;
  nodeVal: ReturnType<typeof vi.fn>;
  zoom: ReturnType<typeof vi.fn>;
  nodeLabel: ReturnType<typeof vi.fn>;
  linkVisibility: ReturnType<typeof vi.fn>;
  linkColor: ReturnType<typeof vi.fn>;
  linkWidth: ReturnType<typeof vi.fn>;
  nodePointerAreaPaint: ReturnType<typeof vi.fn>;
  nodeId: ReturnType<typeof vi.fn>;
  onNodeClick: ReturnType<typeof vi.fn>;
  onNodeHover: ReturnType<typeof vi.fn>;
  onBackgroundClick: ReturnType<typeof vi.fn>;
  nodeCanvasObjectMode: ReturnType<typeof vi.fn>;
  linkDirectionalParticleWidth: ReturnType<typeof vi.fn>;
  nodeColor: ReturnType<typeof vi.fn>;
  autoPauseRedraw: ReturnType<typeof vi.fn>;
  nodeCanvasObject: ReturnType<typeof vi.fn>;
  d3VelocityDecay: ReturnType<typeof vi.fn>;
  warmupTicks: ReturnType<typeof vi.fn>;
  graphData: ReturnType<typeof vi.fn<(graphData: RendererGraphPayload) => RendererMock>>;
  d3Force: ReturnType<typeof vi.fn>;
  width: ReturnType<typeof vi.fn>;
  height: ReturnType<typeof vi.fn>;
  d3ReheatSimulation: ReturnType<typeof vi.fn>;
  pauseAnimation: ReturnType<typeof vi.fn>;
  _destructor: ReturnType<typeof vi.fn>;
}

const renderer = {} as RendererMock;
const returnRenderer = () => renderer;
const distance = vi.fn();
const strength = vi.fn();
const resizeObserverObserve = vi.fn();
const resizeObserverDisconnect = vi.fn();

const callbacks = {
  nodeClick: undefined as ((node: unknown) => void) | undefined,
  nodeHover: undefined as ((node?: unknown) => void) | undefined,
  backgroundClick: undefined as (() => void) | undefined,
};

Object.assign(renderer, {
  nodeRelSize: vi.fn(returnRenderer),
  nodeVal: vi.fn(returnRenderer),
  zoom: vi.fn(returnRenderer),
  nodeLabel: vi.fn(returnRenderer),
  linkVisibility: vi.fn(returnRenderer),
  linkColor: vi.fn(returnRenderer),
  linkWidth: vi.fn(returnRenderer),
  nodePointerAreaPaint: vi.fn(returnRenderer),
  nodeId: vi.fn(returnRenderer),
  onNodeClick: vi.fn((handler) => {
    callbacks.nodeClick = handler;
    return renderer;
  }),
  onNodeHover: vi.fn((handler) => {
    callbacks.nodeHover = handler;
    return renderer;
  }),
  onBackgroundClick: vi.fn((handler) => {
    callbacks.backgroundClick = handler;
    return renderer;
  }),
  nodeCanvasObjectMode: vi.fn(returnRenderer),
  linkDirectionalParticleWidth: vi.fn(returnRenderer),
  nodeColor: vi.fn(returnRenderer),
  autoPauseRedraw: vi.fn(returnRenderer),
  nodeCanvasObject: vi.fn(returnRenderer),
  d3VelocityDecay: vi.fn(returnRenderer),
  warmupTicks: vi.fn(returnRenderer),
  graphData: vi.fn<(graphData: RendererGraphPayload) => typeof renderer>(returnRenderer),
  d3Force: vi.fn(() => ({ distance, strength })),
  width: vi.fn(returnRenderer),
  height: vi.fn(returnRenderer),
  d3ReheatSimulation: vi.fn(returnRenderer),
  pauseAnimation: vi.fn(returnRenderer),
  _destructor: vi.fn(),
});

vi.mock('force-graph', () => ({ default: () => () => renderer }));
vi.mock('d3-force-3d', () => ({ forceCollide: () => ({ strength: () => ({}) }) }));

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: class ResizeObserver {
    observe = resizeObserverObserve;
    disconnect = resizeObserverDisconnect;
  },
});

Object.defineProperty(globalThis, 'MutationObserver', {
  configurable: true,
  writable: true,
  value: class MutationObserver {
    observe = vi.fn();
    disconnect = vi.fn();
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  callbacks.nodeClick = undefined;
  callbacks.nodeHover = undefined;
  callbacks.backgroundClick = undefined;
});

const flushGraphRender = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const graph: GraphViewModel = {
  nodes: [
    { id: 'alpha', label: 'Alpha', weight: 3, path: '/notes/alpha.org' },
    { id: 'beta', label: 'Beta', weight: 2, path: '/notes/beta.org' },
  ],
  edges: [{ id: 'alpha::beta', source: 'alpha', target: 'beta' }],
};

const defaultGraphConfig = {
  nodeRelSize: 4,
  linkDistance: 50,
  chargeStrength: -80,
  warmupTicks: 150,
  velocityDecay: 0.3,
  initialZoom: 1.5,
  labelFontSize: 12,
  linkWidth: 0.5,
};

const createProps = (overrides: Partial<AppGraphProps> = {}): AppGraphProps => ({
  graph,
  graphConfig: defaultGraphConfig,
  ...overrides,
});

test('AppGraph passes graph data to force renderer', async () => {
  const wrapper = mount(AppGraph, {
    props: createProps(),
  });

  await flushGraphRender();

  expect(wrapper.find('[data-test="graph-canvas"]').exists()).toBe(true);
  const firstGraphCall = renderer.graphData.mock.calls.at(0);
  if (!firstGraphCall) {
    throw new Error('Expected graphData to be called');
  }

  const graphPayload = firstGraphCall[0];

  expect(graphPayload.links).toEqual([{ id: 'alpha::beta', source: 'alpha', target: 'beta' }]);
  expect(graphPayload.nodes).toEqual(graph.nodes);
  expect(graphPayload.nodes).not.toBe(graph.nodes);
  expect(graphPayload.links).not.toBe(graph.edges);
  expect(renderer.d3Force).toHaveBeenCalledWith('link');
  expect(distance).toHaveBeenCalledTimes(1);
});

test('AppGraph emits nodeClick when node is clicked', async () => {
  const wrapper = mount(AppGraph, {
    props: createProps(),
  });

  await flushGraphRender();

  callbacks.nodeClick?.(graph.nodes[0]);

  expect(wrapper.emitted('nodeClick')?.[0]?.[0]).toMatchObject({ id: 'alpha' });
});

test('AppGraph emits backgroundClick when renderer background is clicked', async () => {
  const wrapper = mount(AppGraph, {
    props: createProps(),
  });

  await flushGraphRender();

  callbacks.backgroundClick?.();

  expect(wrapper.emitted('backgroundClick')).toHaveLength(1);
});

test('AppGraph emits nodeHover when renderer hover changes', async () => {
  const wrapper = mount(AppGraph, {
    props: createProps(),
  });

  await flushGraphRender();

  callbacks.nodeHover?.('alpha');

  expect(wrapper.emitted('nodeHover')?.[0]).toEqual(['alpha']);
});

test('AppGraph renders empty state when graph has no nodes', () => {
  const wrapper = mount(AppGraph, {
    props: createProps({ graph: { nodes: [], edges: [] } }),
  });

  expect(wrapper.text()).toContain('graph.empty.title');
});

test('AppGraph does not reset graph data when only highlighted nodes change', async () => {
  const wrapper = mount(AppGraph, {
    props: createProps(),
  });

  await flushGraphRender();
  vi.clearAllMocks();

  await wrapper.setProps({ highlightedNodeIds: ['alpha', 'beta'] });
  await nextTick();
  await flushGraphRender();

  expect(renderer.graphData).not.toHaveBeenCalled();
  expect(renderer.d3ReheatSimulation).not.toHaveBeenCalled();
  expect(renderer.nodeColor).toHaveBeenCalled();
  expect(renderer.linkColor).toHaveBeenCalled();
});

test('AppGraph destroys force renderer on unmount', async () => {
  const wrapper = mount(AppGraph, {
    props: createProps(),
  });

  await flushGraphRender();
  wrapper.unmount();

  expect(renderer._destructor).toHaveBeenCalledTimes(1);
  expect(resizeObserverDisconnect).toHaveBeenCalled();
});
