import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note, NotesFilter } from 'src/models';

interface NotesState {
  notes: Note[];
  selectedNote?: Note;
  notesCount?: number;
  filters?: NotesFilter;
}

const notesBufferLimit = 100;
const defaultLimit = 10;
const defaultOffset = 0;

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
        this.notesCount = rspns.meta.total;
        this.setFilters({
          limit: rspns.meta.limit,
          offset: rspns.meta.offset,
        });
      } catch (e) {
        // TODO: master real error handling
        console.log('🦄: [line 24][notes.ts] [35me: ', e);
      }
    },
    async fetchNotes(offset: number) {
      // TODO: need to clear this bucket with respect buffer limit
      if (this.filters.offset === offset) {
        return;
      }
      this.setFilters({ offset });
      try {
        const rspns = await sdk.getNotes(this.filters);
        this.notes = [...this.notes, ...rspns.data];
        this.notesCount = rspns.meta.total;
      } catch (e) {}
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
    setFilters(filter: Partial<NotesFilter>) {
      const updatedFilters = { ...this.filters, ...filter };
      updatedFilters.limit ||= defaultLimit;
      updatedFilters.offset ||= defaultOffset;
      this.filters = updatedFilters;
    },
  },
});
