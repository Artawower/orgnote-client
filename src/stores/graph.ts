import { defineStore } from 'pinia';
import { GraphNoteNode, NoteGraph } from 'src/models';
import {
  GraphUpdated,
  UpdateGraph,
  GraphWorkerEvent,
  newGraphWorker,
} from 'src/workers';

import { computed, ref } from 'vue';

export const useGraphStore = defineStore('graph', () => {
  const graph = ref<NoteGraph>(null);
  const loading = ref<boolean>(false);
  const error = ref<Error>(null);

  const connection = newGraphWorker();
  const graphLinks = ref<{ [id: string]: string[] }>({});

  const rebuildGraph = () => {
    connection.emit(new UpdateGraph());
    connection
      .watchMessage<GraphUpdated>(GraphWorkerEvent.GraphUpdated)
      .subscribe((data) => {
        graph.value = data.payload;
        getGraphLinks();
      });
  };

  const getGraphLinks = () => {
    if (!graph.value) {
      graphLinks.value = {};
    }
    graphLinks.value = graph.value.links.reduce<{ [id: string]: string[] }>(
      (acc, curr) => {
        if (!acc[curr.source]) {
          acc[curr.source] = [];
        }
        if (!acc[curr.target]) {
          acc[curr.target] = [];
        }
        acc[curr.source].push(curr.target);
        acc[curr.target].push(curr.source);
        return acc;
      },
      {}
    );
  };

  const graphNodes = computed(() => {
    return graph.value.nodes.reduce<{ [id: string]: GraphNoteNode }>(
      (acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      },
      {}
    );
  });

  const loadGraph = async () => {
    rebuildGraph();
  };

  return {
    graph,
    loading,
    graphNodes,
    graphLinks,
    error,
    loadGraph,
    rebuildGraph,
  };
});
