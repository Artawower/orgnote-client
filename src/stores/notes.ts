import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note, NotesFilter } from 'src/models';

interface NotesState {
  notes: Note[];
  selectedNote?: Note;
  filters?: NotesFilter;
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
    selectedNote: null,
    filters: {
      limit: 10,
      offset: 0,
    },
  }),

  getters: {},

  actions: {
    async loadNotes() {
      try {
        const rspns = await sdk.getNotes(this.filters);
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
        this.selectedNote = rspns.data;
      } catch (e) {
        // TODO: master  handle todo here
        console.log('🦄: [line 41][notes.ts] [35me: ', e);
      }
    },
    setFilters(filter: NotesFilter) {
      this.filters = { ...this.filters, ...filter };
    },
  },
});
