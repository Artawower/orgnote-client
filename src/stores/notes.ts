import { useFileManagerStore } from './file-manager';
import { useSyncStore } from './sync';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { HandlersCreatingNote } from 'src/generated/api';
import { Note, NotePreview, NotesFilter } from 'src/models';

import { ref } from 'vue';

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

  const syncStore = useSyncStore();
  const fileManagerStore = useFileManagerStore();

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
    await fileManagerStore.updateFileManager();
    await loadNotes();
  };

  const markAsDeleted = async (noteIds: string[]) => {
    await repositories.notes.markAsDeleted(noteIds);
    await fileManagerStore.updateFileManager();
    await syncStore.syncNotes();
  };

  const upsertNotes = async (notes: Note[]) => {
    await repositories.notes.saveNotes(notes);
    loadNotes();
  };

  const upsertNotesLocally = async (notes: Note[]) => {
    await upsertNotes(notes);
    await syncStore.syncNotes();
    await fileManagerStore.updateFileManager();
  };

  const bulkPathNotesLocally = async (
    updates: { id: string; changes: Partial<Note> }[]
  ) => {
    await repositories.notes.bulkPartialUpdate(updates);
    notes.value = notes.value.map((n) => {
      const changedNote = updates.find((cn) => cn.id === n.id);
      if (changedNote) {
        return {
          ...n,
          ...changedNote.changes,
          updateAt: new Date().toISOString(),
        };
      }
      return n;
    });
    await syncStore.syncNotes();
  };

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
    // TODO: master optimize. Do nothing when notes already loaded
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
      syncStore.syncNotes();
    } catch (e) {
      // TODO: master handle error
      console.log('✎: [line 68][notes.ts] e: ', e);
    }
  };

  const loadNotes = async () => {
    notes.value = await repositories.notes.getNotePreviews(
      filters.value.limit,
      filters.value.offset
    );
    total.value = await repositories.notes.count();
  };

  const loadTotal = async () => {
    total.value = await repositories.notes.count();
  };

  const resetCache = () => {
    notes.value = [];
  };

  return {
    notes,
    selectedNote,
    total,
    filters,
    markAsDeleted,

    loadNotes,
    loadTotal,
    deleteNotes,
    fetchNotes,
    setFilters,
    createNote,
    upsertNotes,
    upsertNotesLocally,
    bulkPathNotesLocally,
    resetCache,
  };
});
