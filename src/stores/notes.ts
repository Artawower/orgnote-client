import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note, NotesFilter } from 'src/models';
import { RouteNames } from 'src/router/routes';

interface NotesState {
  notes: Note[];
  selectedNote?: Note;
  notesCount?: number;
  filters?: NotesFilter;
}

const notesBufferLimit = 100;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;

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
      } catch (e: any) {
        if (e.response?.status === 404) {
          // TODO: master https://github.com/quasarframework/quasar/pull/14080
          (this as any).router.push({ name: RouteNames.NotFound });
          return;
        }
        // TODO: master  handle todo here
        console.log('🦄: [line 41][notes.ts] [35me: ', e);
      }
    },
    setFilters(filter: Partial<NotesFilter>) {
      const updatedFilters = { ...this.filters, ...filter };
      updatedFilters.searchText = updatedFilters.searchText?.trim();
      updatedFilters.limit ||= DEFAULT_LIMIT;
      updatedFilters.offset ||= DEFAULT_OFFSET;
      this.filters = updatedFilters;
    },
  },
});
