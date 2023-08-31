import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { HandlersCreatingNote } from 'src/generated/api';
import { Note, NotePreview, NotesFilter } from 'src/models';
import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';

export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<NotePreview[]>([]);
  const filters = ref<NotesFilter>({
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
  });
  const total = ref<number>(0);
  const selectedNote = ref<Note>();

  const setFilters = (filter: Partial<NotesFilter>) => {
    const updatedFilters = { ...filters.value, ...filter };
    updatedFilters.searchText = updatedFilters.searchText?.trim();
    updatedFilters.limit ||= DEFAULT_LIMIT;
    updatedFilters.offset ||= DEFAULT_OFFSET;
    filters.value = updatedFilters;
  };

  const deleteNotes = async (noteIds: string[]) => {
    const previousNotes = [...notes.value];
    try {
      await sdk.notes.notesDelete(noteIds);
      notes.value = notes.value.filter((n) => !noteIds.includes(n.id));
    } catch (e) {
      // TODO: master real error handling [low]
      notes.value = previousNotes;
    }
  };

  // TODO: master check what is it
  const fetchNotes = async (offset: number) => {
    //   // TODO: need to clear this bucket with respect buffer limit
    if (filters.value.offset === offset) {
      return;
    }
    setFilters({ offset });
    const data = await repositories.notes.getNotePreviews(
      filters.value.limit,
      filters.value.offset,
      filters.value.searchText
    );
    notes.value = [...notes.value, ...data];
  };

  const createNote = async (note: HandlersCreatingNote) => {
    try {
      await sdk.notes.notesPost(note);
      loadNotes();
    } catch (e) {}
  };

  const upsertNote = async (note: HandlersCreatingNote) => {
    try {
      await repositories.notes.putNote(note);
      await sdk.notes.notesBulkUpsertPut([note]);
      loadNotes();
    } catch (e) {
      // TODO: master handle error
      console.log('✎: [line 138][indexeddb] e: ', e);
    }
  };

  const loadNotes = async () => {
    notes.value = await repositories.notes.getNotePreviews(
      filters.value.limit,
      filters.value.offset
    );
    total.value = await repositories.notes.count();
  };

  return {
    notes,
    selectedNote,
    total,
    filters,

    loadNotes,
    deleteNotes,
    fetchNotes,
    setFilters,
    createNote,
    upsertNote,
  };
});
