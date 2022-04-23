import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';

interface NotesState {
  // TODO: master add real type
  notes: any[];
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
  }),

  getters: {
    notes(state: NotesState) {
      return state.notes;
    },
  },

  actions: {
    // TODO: master add type
    async loadNotes(): any {
      try {
        const notes = await sdk.getNotes();
        this.$state.notes = notes;
      } catch (e) {
        // TODO: master real error handling
        console.log('🦄: [line 24][notes.ts] [35me: ', e);
      }
    },
  },
});
