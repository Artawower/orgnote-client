import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { NoteGraph } from 'src/models';

interface GraphState {
  // TODO: add correct type for graph
  graph: NoteGraph;
  loading: boolean;
  error?: Error;
}

export const useGraphStore = defineStore('graph', {
  state: (): GraphState => ({
    graph: null,
    loading: false,
    error: null,
  }),
  actions: {
    async loadGraph() {
      try {
        this.graph = (await sdk.getGraph()).data;
      } catch (e) {
        // TODO: handle error
        console.warn(e);
      }
    },
  },
});
