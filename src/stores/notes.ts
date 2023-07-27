import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { HandlersCreatedNote } from 'src/generated/api';
import { Note, NotesFilter } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { mapRawNoteToNote } from 'src/tools';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './auth';

export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const filters = ref<NotesFilter>({ limit: 10, offset: 0 });
  const notesCount = ref<number>();
  const selectedNote = ref<Note>();
  const authStore = useAuthStore();

  const setFilters = (filter: Partial<NotesFilter>) => {
    const updatedFilters = { ...filters.value, ...filter };
    updatedFilters.searchText = updatedFilters.searchText?.trim();
    updatedFilters.limit ||= DEFAULT_LIMIT;
    updatedFilters.offset ||= DEFAULT_OFFSET;
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
      // getNotes(this.filters);
      notes.value = rspns.data.data.map((n) =>
        mapRawNoteToNote(n, authStore.user)
      );
      notesCount.value = rspns.data.meta.total;
      setFilters({
        limit: rspns.data.meta.limit,
        offset: rspns.data.meta.offset,
      });
    } catch (e) {
      // TODO: master real error handling
      console.log('🦄: [line 24][notes.ts] [35me: ', e);
    }
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
      notes.value = [
        ...notes.value,
        ...rspns.data.data.map((n) => mapRawNoteToNote(n, authStore.user)),
      ];
      notesCount.value = rspns.data.meta.total;
    } catch (e) {
      // TODO: master real error handling [low]
    }
  };

  const selectNote = (note: Note): void => {
    selectedNote.value = note;
  };

  const router = useRouter();

  // TODO: master simplify this method
  const selectNoteById = async (noteId: string): Promise<void> => {
    const alreadySelected = selectedNote.value?.id === noteId;
    if (alreadySelected) {
      return;
    }
    const foundNote = notes.value.find((note) => note.id === noteId);
    if (foundNote) {
      selectedNote.value = foundNote as Note;
      return;
    }

    try {
      selectedNote.value = mapRawNoteToNote(
        (await sdk.notes.notesIdGet(noteId)).data.data,
        authStore.user
      );
    } catch (e: unknown) {
      if ((e as AxiosError).response?.status === 404) {
        router.push({ name: RouteNames.NotFound });
        return;
      }
      // TODO: master handle error here [low]
      console.log('🦄: [line 41][notes.ts] [35me: ', e);
    }
  };

  const createNote = async (note: HandlersCreatedNote) => {
    try {
      await sdk.notes.notesPost(note);
      loadNotes();
    } catch (e) {}
  };

  const upsertNote = async (note: HandlersCreatedNote) => {
    try {
      await sdk.notes.notesBulkUpsertPut([note]);
      loadNotes();
    } catch (e) {}
  };

  return {
    notes,
    selectedNote,
    notesCount,
    filters,

    loadNotes,
    deleteNotes,
    fetchNotes,
    selectNote,
    selectNoteById,
    setFilters,
    createNote,
    upsertNote,
  };
});
