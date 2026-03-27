import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, expect, test, vi } from 'vitest';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));
import type { FileMeta } from 'orgnote-api';

const getAll = vi.fn<() => Promise<FileMeta[]>>();
const open = vi.fn<() => Promise<void>>();
const activeContext = ref<{ filePath?: string } | null>(null);
const config = ref({ ui: { graph: {} } });

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useConfig: () => ({ config }),
      useFileMeta: () => ({ getAll }),
      useEditor: () => ({ activeContext: activeContext.value }),
      useBufferViewer: () => ({ open }),
    },
  },
}));

import GraphContainer from './GraphContainer.vue';

beforeEach(() => {
  vi.clearAllMocks();
  activeContext.value = null;
  getAll.mockResolvedValue([
    {
      id: 'alpha',
      filePath: ['notes', 'alpha.org'],
      title: 'Alpha',
      links: ['beta'],
    },
    {
      id: 'beta',
      filePath: ['notes', 'beta.org'],
      title: 'Beta',
    },
  ]);
});

test('GraphContainer loads graph metadata on mount', async () => {
  const wrapper = mount(GraphContainer, {
    global: {
      stubs: {
        AppGraph: {
          name: 'AppGraph',
          props: ['graph', 'selectedNodeId', 'highlightedNodeIds', 'loading', 'error'],
          template: '<div class="graph-stub" />',
        },
      },
    },
  });

  await flushPromises();

  const graph = wrapper.getComponent({ name: 'AppGraph' }).props('graph') as {
    nodes: Array<{ id: string }>;
    edges: Array<{ id: string }>;
  };

  expect(graph.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(['alpha', 'beta']));
  expect(graph.edges).toEqual([{ id: 'alpha::beta', source: 'alpha', target: 'beta' }]);
});

test('GraphContainer highlights active editor note when available', async () => {
  activeContext.value = { filePath: '/notes/beta.org' };

  const wrapper = mount(GraphContainer, {
    global: {
      stubs: {
        AppGraph: {
          name: 'AppGraph',
          props: ['graph', 'selectedNodeId', 'highlightedNodeIds', 'loading', 'error'],
          template: '<div class="graph-stub" />',
        },
      },
    },
  });

  await flushPromises();

  expect(wrapper.getComponent({ name: 'AppGraph' }).props('selectedNodeId')).toBe('beta');
});

test('GraphContainer opens selected note when nodeClick is emitted', async () => {
  const wrapper = mount(GraphContainer, {
    global: {
      stubs: {
        AppGraph: {
          name: 'AppGraph',
          props: ['graph', 'selectedNodeId', 'highlightedNodeIds', 'loading', 'error'],
          template: '<div class="graph-stub" />',
        },
      },
    },
  });

  await flushPromises();

  await wrapper.getComponent({ name: 'AppGraph' }).vm.$emit('nodeClick', {
    id: 'alpha',
    label: 'Alpha',
    weight: 2,
    path: '/notes/alpha.org',
  });

  expect(open).toHaveBeenCalledWith('file:///notes/alpha.org');
});

test('GraphContainer keeps selected-node highlight when hover is cleared', async () => {
  activeContext.value = { filePath: '/notes/beta.org' };

  const wrapper = mount(GraphContainer, {
    global: {
      stubs: {
        AppGraph: {
          name: 'AppGraph',
          props: ['graph', 'selectedNodeId', 'highlightedNodeIds', 'loading', 'error'],
          template: '<div class="graph-stub" />',
        },
      },
    },
  });

  await flushPromises();

  await wrapper.getComponent({ name: 'AppGraph' }).vm.$emit('nodeHover', 'alpha');
  await flushPromises();

  expect(wrapper.getComponent({ name: 'AppGraph' }).props('highlightedNodeIds')).toEqual([
    'alpha',
    'beta',
  ]);

  await wrapper.getComponent({ name: 'AppGraph' }).vm.$emit('nodeHover', undefined);
  await flushPromises();

  expect(wrapper.getComponent({ name: 'AppGraph' }).props('highlightedNodeIds')).toEqual([
    'beta',
    'alpha',
  ]);
});
