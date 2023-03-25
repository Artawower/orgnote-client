<template>
  <div class="chart-wrapper" :ref="(ref) => (chartWrapper = ref)"></div>
</template>

<script lang="ts" setup>
import { ref, watch, toRef } from 'vue';
import ForceGraph, { NodeObject } from 'force-graph';
import { useQuasar } from 'quasar';
import { useGraphStore } from 'src/stores/graph';
import { GraphNoteNode } from 'src/models';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
type GraphNode = GraphNoteNode & NodeObject;

const chartWrapper = ref(null);
const q$ = useQuasar();

const graphStore = useGraphStore();
graphStore.loadGraph();
const graph = toRef(graphStore, 'graph');

const router = useRouter();
const goToRowDetail = (id: string) => {
  router.push({ name: RouteNames.NoteDetail, params: { id } });
};

const getGrpahHeight = () =>
  window.innerHeight -
  parseInt(
    getComputedStyle(document.body).getPropertyValue('--top-bar-height')
  );

const buildGraph = () => {
  if (!graph.value || !graph.value.nodes) {
    return;
  }
  const minCircleSize = 6;
  // TODO: master color palette service
  const mainColor = () => (q$.dark.isActive ? 'white' : 'black');

  ForceGraph()(chartWrapper.value)
    .nodeRelSize(minCircleSize)
    .nodeVal((node) => (node as GraphNode).weight)
    .nodeAutoColorBy('group')
    .nodeLabel((node) => `${(node as GraphNode).title}`)
    .linkVisibility(() => true)
    .linkColor(() => mainColor())
    .linkDirectionalParticles(0)
    .onNodeClick((node) => goToRowDetail((node as GraphNode).id))
    .height(getGrpahHeight())
    .nodeCanvasObjectMode(() => 'after')
    .linkDirectionalParticleWidth(1.4)
    .nodeCanvasObject((node, ctx, globalScale) => {
      if (
        ((node as GraphNode).weight <= 1 && globalScale < 4) ||
        ((node as GraphNode).weight > 1 &&
          2 / ((node as GraphNode).weight / 5) >= globalScale)
      ) {
        return;
      }

      const label = node.id;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = mainColor();
      ctx.fillText(`${label}`, node.x, node.y + 20);
    })
    .graphData(graph.value);

  // TODO: try with d3 graph
  // htmlSvg.value = ForceGraph(data, {
  //   nodeTitle: (d: GraphNode) => `${ d.id }(${ d.group })`,
  //   nodeRadius: (d: GraphNode) => d.size || 10,
  //   nodeFill: (d: GraphNode) => d?.color || '#ccc',
  // });
  //
  // svg.value.appendChild(htmlSvg.value);
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
    height: calc(100vh - var(--top-bar-height)) !important;
  }
}
</style>
