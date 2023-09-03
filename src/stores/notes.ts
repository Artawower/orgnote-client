import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { HandlersCreatingNote } from 'src/generated/api';
import { Note, NotePreview, NotesFilter } from 'src/models';
import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';

export const DEFAULT_LIMIT = 20;
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
    await repositories.notes.deleteNotes(noteIds);
    notes.value = notes.value.filter((n) => !noteIds.includes(n.id));
  };

  const upsertNotes = async (notes: Note[]) => {
    await repositories.notes.saveNotes(notes);
    loadNotes();
  };

  // TODO: master check what is it
  const fetchNotes = async (offset: number, limit: number) => {
    if (filters.value.offset === offset) {
      return;
    }

    setFilters({ offset });
    const data = await repositories.notes.getNotePreviews(
      limit,
      offset,
      filters.value.searchText
    );
    const indexedNotes = [...notes.value];
    data.forEach((v, i) => {
      indexedNotes[i + offset] = v;
    });
    notes.value = indexedNotes;
  };

  const createNote = async (note: HandlersCreatingNote) => {
    try {
      await sdk.notes.notesPost(note);
      loadNotes();
    } catch (e) {}
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
    upsertNotes,
  };
});
