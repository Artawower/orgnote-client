<template>
  <div ref="rootRef" class="app-graph">
    <div v-if="!graph.nodes.length" class="state-wrapper">
      <empty-state
        icon="sym_o_hub"
        :title="t(i18n.GRAPH_EMPTY_TITLE)"
        :description="t(i18n.GRAPH_EMPTY_DESCRIPTION)"
      />
    </div>

    <div
      v-else
      ref="graphRef"
      class="graph-canvas"
      data-test="graph-canvas"
      role="img"
      :aria-label="t(i18n.GRAPH_TITLE)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import type { GraphNodeViewModel, GraphViewModel } from 'src/models/graph';
import EmptyState from 'src/components/EmptyState.vue';
import { useI18n } from 'vue-i18n';
import { I18N as i18n } from 'orgnote-api';
import type { GraphUiConfig } from 'orgnote-api';
import { useGraphColors } from './use-graph-colors';
import { useGraphRenderer } from './use-graph-renderer';

export interface AppGraphProps {
  graph: GraphViewModel;
  selectedNodeId?: string;
  highlightedNodeIds?: string[];
  graphConfig: GraphUiConfig;
  dimUnrelated?: boolean;
}

const props = withDefaults(defineProps<AppGraphProps>(), {
  selectedNodeId: undefined,
  highlightedNodeIds: () => [],
  dimUnrelated: true,
});

const emit = defineEmits<{
  (e: 'nodeClick', node: GraphNodeViewModel): void;
  (e: 'nodeHover', nodeId?: string): void;
  (e: 'backgroundClick'): void;
}>();

const { t } = useI18n();
const rootRef = ref<HTMLElement>();
const graphRef = ref<HTMLElement>();

const highlightedNodeSet = computed(() => new Set(props.highlightedNodeIds));
const shouldRenderGraph = computed(() => props.graph.nodes.length > 0);

const colors = useGraphColors();
const renderer = useGraphRenderer({
  colors,
  getConfig: () => props.graphConfig,
  getDimUnrelated: () => props.dimUnrelated,
  getHighlightedSet: () => highlightedNodeSet.value,
  getSelectedNodeId: () => props.selectedNodeId,
  onNodeClick: (node) => emit('nodeClick', node),
  onNodeHover: (nodeId) => emit('nodeHover', nodeId),
  onBackgroundClick: () => emit('backgroundClick'),
});

const renderGraph = (): void => {
  if (!shouldRenderGraph.value) {
    renderer.destroy(graphRef.value);
    return;
  }

  if (graphRef.value) {
    renderer.create(graphRef.value, props.graph.nodes.length);
    renderer.setSize(rootRef.value, graphRef.value);
    renderer.syncData(props.graph, true);
    renderer.syncColors();
  }
};

useResizeObserver(rootRef, ([entry]) => {
  if (!entry) return;
  renderer.queueResize({
    width: entry.contentRect.width,
    height: entry.contentRect.height,
    shouldRender: shouldRenderGraph.value,
    rootEl: rootRef.value,
    graphEl: graphRef.value,
    graph: props.graph,
  });
});

onMounted(renderGraph);

onBeforeUnmount(() => {
  renderer.destroy(graphRef.value);
});

watch(shouldRenderGraph, renderGraph, { flush: 'post' });

watch(
  () => props.graph,
  () => {
    if (!shouldRenderGraph.value || !renderer.isActive()) return;
    renderer.syncData(props.graph);
  },
);

watch(
  () => [props.selectedNodeId, props.highlightedNodeIds] as const,
  () => {
    if (!shouldRenderGraph.value || !renderer.isActive()) return;
    renderer.syncColors();
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.app-graph {
  @include fit;
  min-height: var(--graph-canvas-min-height);
  border: var(--border-default);
  border-radius: var(--border-radius-lg);
  background:
    radial-gradient(
      circle at top,
      color-mix(in srgb, var(--accent) 10%, transparent),
      transparent 55%
    ),
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 86%, var(--bg-alt) 14%), var(--bg));
  overflow: hidden;
}

.state-wrapper {
  height: 100%;
  padding: var(--page-padding);
}

.progress {
  margin-top: var(--margin-md);
}

.graph-canvas {
  @include fit;
  min-height: var(--graph-canvas-min-height);
  display: block;
}
</style>
