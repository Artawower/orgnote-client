<template>
  <q-no-ssr>
    <div class="chart-wrapper" ref="chartWrapper"></div>
    <span>
      <mobile-note-preview
        :note-id="selectedNoteId"
        @closed="resetSelectedNote"
      />
    </span>
  </q-no-ssr>
</template>

<script lang="ts" setup>
// TODO: master move to external container
import ForceGraph, { LinkObject, NodeObject } from 'force-graph';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { GraphNoteNode } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { useGraphStore } from 'src/stores/graph';
import { getCssVar, hexToRgba, mockServer, truncate } from 'src/tools';
import { useRouter } from 'vue-router';

import { ref, watch } from 'vue';

import MobileNotePreview from 'src/components/containers/MobileNotePreview.vue';

const chartWrapper = ref<HTMLElement>(null);

const graphStore = useGraphStore();
graphStore.loadGraph();
const { graph } = storeToRefs(graphStore);

const router = useRouter();
const goToRowDetail = (id: string) => {
  router.push({ name: RouteNames.NoteDetail, params: { id } });
};

const getGrpahHeight = mockServer(
  (): number =>
    window.innerHeight -
    parseInt(
      getComputedStyle(document.body).getPropertyValue('--top-bar-height')
    ),
  1000
);

const findConnectedLinks = (
  nodeId: string,
  foundedNodeIds: string[] = []
): string[] => {
  if (foundedNodeIds.includes(nodeId)) {
    return foundedNodeIds;
  }

  const unvisitedNode = graphStore.graphLinks[nodeId];
  foundedNodeIds.push(nodeId);
  if (unvisitedNode) {
    unvisitedNode.forEach((nodeId) => {
      findConnectedLinks(nodeId, foundedNodeIds);
    });
  }

  return foundedNodeIds;
};

const getGraphWidth = mockServer(() => window.innerWidth, 0);
let activeNodeIds: string[] = [];
let activeNodeId: string;

const recalculateHighlightedNodes = (currentNodeId: string) => {
  activeNodeId = currentNodeId;
  if (!currentNodeId) {
    activeNodeIds = [];
    return;
  }
  activeNodeIds = findConnectedLinks(currentNodeId);
};

const minCircleSize = 12;
const mainColor = () => getCssVar('graph-node-color');
const edgeColor = () => getCssVar('graph-edge-color');
const activeColor = () => getCssVar('graph-active-color');

const getNodeColor = (node: NodeObject) => {
  if (activeNodeIds.includes(node.id as string)) {
    return activeColor();
  }
  if (activeNodeId) {
    return hexToRgba(mainColor(), 0.6);
  }
  return mainColor();
};

const getEdgeColor = (link: LinkObject) => {
  const l = link as { source: { id: string }; target: { id: string } };
  if (
    activeNodeIds.includes(l.source.id as string) ||
    activeNodeIds.includes(l.target.id as string)
  ) {
    return activeColor();
  }
  if (activeNodeId) {
    return hexToRgba(mainColor(), 0.6);
  }
  return edgeColor();
};

const $q = useQuasar();
// const scaleFactorLimit = $q.platform.is.mobile ? 0.8 : 1;
const selectedNoteId = ref<string | null>(null);

const resetSelectedNote = (): void => (selectedNoteId.value = null);

const nodeClick = (node: NodeObject) => {
  const id = (node as GraphNoteNode).id;
  if ($q.platform.is.mobile) {
    selectedNoteId.value = id;
    return;
  }
  goToRowDetail(id);
};

const buildGraph = () => {
  if (!graph.value || !graph.value.nodes) {
    return;
  }

  ForceGraph()(chartWrapper.value)
    .nodeRelSize(minCircleSize)
    .nodeVal((node) => (node as GraphNoteNode).weight)
    .zoom(0.3)
    .nodeLabel((node) => `${(node as GraphNoteNode).title}`)
    .linkVisibility(() => true)
    .linkColor(getEdgeColor)
    .nodeId('id')
    .onNodeClick(nodeClick)
    .height(getGrpahHeight())
    .width(getGraphWidth())
    .onNodeHover((node) => {
      recalculateHighlightedNodes(node?.id as string);
    })
    .nodeCanvasObjectMode(() => 'before')
    .linkDirectionalParticleWidth(1.4)
    .nodeColor(getNodeColor)
    .autoPauseRedraw(false)
    .nodeCanvasObject((node, ctx, globalScale) => {
      const n = node as GraphNoteNode;
      const minFontSize = 7;
      const nodeInFocus = n.id === activeNodeId;

      const fontSize = 16 * globalScale * n.weight * 0.8;
      if (fontSize < minFontSize || nodeInFocus) {
        return;
      }

      const realFontSize = fontSize > 16 ? 16 : fontSize;

      const label = n.title ? truncate(n.title, 20) : '';
      ctx.font = `${realFontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = mainColor();
      ctx.fillText(label, node.x, node.y + minCircleSize * n.weight + 20);
    })
    .graphData(graph.value)
    .d3VelocityDecay(0.3)
    .d3Force('link')
    .distance(
      (l: { target: { weight: number }; source: { weight: number } }) => {
        return 30 * (l.target.weight + l.source.weight);
      }
    );
};

watch(
  () => graph.value,
  () => {
    buildGraph();
  }
);
</script>

<style lang="scss">
.chart-wrapper {
  width: 100%;

  svg,
  canvas {
    width: 100%;
    height: calc(100svh - var(--top-bar-height)) !important;
  }
}
</style>
