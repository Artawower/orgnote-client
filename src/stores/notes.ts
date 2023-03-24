import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note, NotesFilter } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { mapRawNoteToNote } from 'src/tools';

interface NotesState {
  notes: Note[];
  selectedNote?: Note;
  notesCount?: number;
  filters?: NotesFilter;
}

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
        const rspns = await sdk.notes.notesGet(
          this.filters.limit,
          this.filters.offset,
          this.filters.userId,
          this.filters.searchText
        );
        // getNotes(this.filters);
        this.notes = rspns.data.data.map((n) => mapRawNoteToNote(n));
        this.notesCount = rspns.data.meta.total;
        this.setFilters({
          limit: rspns.data.meta.limit,
          offset: rspns.data.meta.offset,
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
        const rspns = await sdk.notes.notesGet(
          this.filters.limit,
          this.filters.offset,
          this.filters.userId,
          this.filters.searchText
        );
        this.notes = [
          ...this.notes,
          ...rspns.data.data.map((n) => mapRawNoteToNote(n)),
        ];
        this.notesCount = rspns.data.meta.total;
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
        this.selectedNote = mapRawNoteToNote(
          (await sdk.notes.notesIdGet(noteId)).data.data
        );
      } catch (e: unknown) {
        if ((e as AxiosError).response?.status === 404) {
          this.router.push({ name: RouteNames.NotFound });
          return;
        }
        // TODO: master handle error here
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
