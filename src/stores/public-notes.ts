import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Note, NotesFilter } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { mapRawNoteToNote } from 'src/tools';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './auth';

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
  const authStore = useAuthStore();

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
      // getNotes(this.filters);
      notes.value = rspns.data.data.map((n) =>
        mapRawNoteToNote({ node: n, user: authStore.user })
      );
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
      notes.value = [
        ...notes.value,
        ...rspns.data.data.map((n) =>
          mapRawNoteToNote({ node: n, user: authStore.user })
        ),
      ];
      total.value = rspns.data.meta.total;
    } catch (e) {
      // TODO: master real error handling [low]
    }
  };

  const selectNote = (note: Note): void => {
    selectedNote.value = note;
  };

  const router = useRouter();

  // TODO: master delete
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
      selectedNote.value = mapRawNoteToNote({
        node: (await sdk.notes.notesIdGet(noteId)).data.data,
        user: authStore.user,
      });
    } catch (e: unknown) {
      if ((e as AxiosError).response?.status === 404) {
        router.push({ name: RouteNames.NotFound });
        return;
      }
      // TODO: master handle error here [low]
      console.log('🦄: [line 41][notes.ts] [35me: ', e);
    }
  };

  return {
    notes,
    selectedNote,
    total,
    filters,

    loadNotes,
    fetchNotes,
    selectNote,
    selectNoteById,
    setFilters,
  };
});
