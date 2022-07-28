import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note } from 'src/models';

interface NotesState {
  notes: Note[];
  selectedNote?: Note;
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
    selectedNote: null,
  }),

  getters: {},

  actions: {
    async loadNotes(userId?: string) {
      try {
        const rspns = await sdk.getNotes(userId);
        this.notes = rspns.data;
      } catch (e) {
        // TODO: master real error handling
        console.log('🦄: [line 24][notes.ts] [35me: ', e);
      }
    },
    selectNote(note: Note) {
      this.selectedNote = note;
    },
    async selectNoteById(noteId: string) {
      // console.log('🦄: [line 32][notes.ts] [35mnoteId: ', noteId);
      const alreadySelected = this.selectedNote?.id === noteId;
      if (alreadySelected) {
        return;
      }
      const foundNote = this.notes.find((note) => note.id === noteId);
      if (foundNote) {
        this.selectedNote = foundNote;
        return;
      }

      try {
        const rspns = await sdk.getNote(noteId);
        // console.log('🦄: [line 43][notes.ts] [35mrspns: ', rspns);
        this.selectedNote = rspns.data;
      } catch (e) {
        // TODO: master  handle todo here
        console.log('🦄: [line 41][notes.ts] [35me: ', e);
      }
    },
  },
});
