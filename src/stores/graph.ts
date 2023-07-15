import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { ModelsNoteGraph } from 'src/generated/api';
import { ref } from 'vue';

export const useGraphStore = defineStore('graph', () => {
  const graph = ref<ModelsNoteGraph>(null);
  const loading = ref<boolean>(false);
  const error = ref<Error>(null);

  const loadGraph = async () => {
    try {
      graph.value = (await sdk.notes.notesGraphGet()).data.data;
    } catch (e) {
      // TODO: handle real error [low]
      console.warn(e);
    }
  };

  return {
    graph,
    loading,
    error,
    loadGraph,
  };
});
