import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note, NotesFilter } from 'src/models';
import { ref } from 'vue';

// TODO: master common pagination
export const PUBLIC_DEFAULT_LIMIT = 1000;
export const PUBLIC_DEFAULT_OFFSET = 0;

export const usePublicNotesStore = defineStore('publicNotes', () => {
  const notes = ref<Note[]>([]);
  const filters = ref<NotesFilter>({
    limit: PUBLIC_DEFAULT_LIMIT,
    offset: PUBLIC_DEFAULT_OFFSET,
  });
  const total = ref<number>(0);
  const selectedNote = ref<Note>();

  const setFilters = (filter: Partial<NotesFilter>) => {
    const updatedFilters = { ...filters.value, ...filter };
    updatedFilters.searchText = updatedFilters.searchText?.trim();
    updatedFilters.limit ||= PUBLIC_DEFAULT_LIMIT;
    updatedFilters.offset ||= PUBLIC_DEFAULT_OFFSET;
    filters.value = updatedFilters;
  };

  const loadNotes = async () => {
    try {
      const rspns = await sdk.notes.notesGet(
        filters.value.limit,
        filters.value.offset,
        filters.value.userId,
        filters.value.searchText
      );
      notes.value = rspns.data.data;
      total.value = rspns.data.meta.total;
      setFilters({
        limit: rspns.data.meta.limit,
        offset: rspns.data.meta.offset,
      });
    } catch (e) {
      // TODO: master real error handling
      console.log('🦄: [line 24][notes.ts] [35me: ', e);
    }
  };

  const fetchNotes = async (offset: number) => {
    // TODO: need to clear this bucket with respect buffer limit
    if (filters.value.offset === offset) {
      return;
    }
    setFilters({ offset });
    try {
      const rspns = await sdk.notes.notesGet(
        filters.value.limit,
        filters.value.offset,
        filters.value.userId,
        filters.value.searchText
      );
      notes.value = [...notes.value, ...rspns.data.data];
      total.value = rspns.data.meta.total;
    } catch (e) {
      // TODO: master real error handling [low]
    }
  };

  const selectNote = (note: Note): void => {
    selectedNote.value = note;
  };

  return {
    notes,
    selectedNote,
    total,
    filters,

    loadNotes,
    fetchNotes,
    selectNote,
    setFilters,
  };
});
