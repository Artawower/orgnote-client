import { defineStore } from 'pinia';
import { Note } from 'second-brain-parser/dist/parser/models';
import { sdk } from 'src/boot/axios';

interface NotesState {
  notes: Note[];
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
  }),

  getters: {},

  actions: {
    async loadNotes() {
      try {
        const rspns = await sdk.getNotes();
        this.notes = rspns.data;
      } catch (e) {
        // TODO: master real error handling
        console.log('🦄: [line 24][notes.ts] [35me: ', e);
      }
    },
  },
});
