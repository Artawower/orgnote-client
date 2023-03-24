import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { ModelsNoteGraph } from 'src/generated/api';

interface GraphState {
  // TODO: add correct type for graph
  graph: ModelsNoteGraph;
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
        this.graph = (await sdk.notes.notesGraphGet()).data.data;
      } catch (e) {
        // TODO: handle error
        console.warn(e);
      }
    },
  },
});
