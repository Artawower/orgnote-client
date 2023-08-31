import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { HandlersCreatingNote } from 'src/generated/api';
import { Note, NotePreview, NotesFilter } from 'src/models';
import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';

export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;

export const useNotesStore = defineStore('notes', () => {
  const notesPreviews = ref<NotePreview[]>([]);
  const filters = ref<NotesFilter>({
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
  });
  const notesCount = ref<number>();
  const selectedNote = ref<Note>();
  // const authStore = useAuthStore();

  const setFilters = (filter: Partial<NotesFilter>) => {
    const updatedFilters = { ...filters.value, ...filter };
    updatedFilters.searchText = updatedFilters.searchText?.trim();
    updatedFilters.limit ||= DEFAULT_LIMIT;
    updatedFilters.offset ||= DEFAULT_OFFSET;
    filters.value = updatedFilters;
  };

  const deleteNotes = async (noteIds: string[]) => {
    const previousNotes = [...notesPreviews.value];
    try {
      await sdk.notes.notesDelete(noteIds);
      notesPreviews.value = notesPreviews.value.filter(
        (n) => !noteIds.includes(n.id)
      );
    } catch (e) {
      // TODO: master real error handling [low]
      notesPreviews.value = previousNotes;
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
    notesPreviews.value = [...notesPreviews.value, ...data];
    //   try {
    //     const rspns = await sdk.notes.notesGet(
    //       filters.value.limit,
    //       filters.value.offset,
    //       filters.value.userId,
    //       filters.value.searchText
    //     );
    //     notesPreview.value = [
    //       ...notesPreview.value,
    //       ...rspns.data.data.map((n) => mapRawNoteToNote(n, authStore.user)),
    //     ];
    //     notesCount.value = rspns.data.meta.total;
    //   } catch (e) {
    //     // TODO: master real error handling [low]
    //   }
  };

  const selectNote = (note: NotePreview): void => {
    // selectedNote.value = note;
  };

  // const router = useRouter();

  // TODO: master move to separated state

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
    notesPreviews.value = await repositories.notes.getNotePreviews(
      filters.value.limit,
      filters.value.offset
    );
    console.log(
      '✎: [line 128][indexeddb] notesPreviews.value: ',
      notesPreviews.value
    );
    notesCount.value = await repositories.notes.count();
    console.log('✎: [line 27][indexeddb] notePreviews: ', notesCount.value);
  };

  return {
    notesPreviews,
    selectedNote,
    notesCount,
    filters,

    loadNotes,
    deleteNotes,
    fetchNotes,
    selectNote,
    setFilters,
    createNote,
    upsertNote,
  };
});
