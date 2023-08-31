import { AxiosError } from 'axios';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { ModelsPublicNote } from 'src/generated/api';
import { Note } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { mapRawNoteToNote } from 'src/tools';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './auth';
import { defineStore } from 'pinia';

export const useCurrentNoteStore = defineStore('current-note', () => {
  const currentNote = ref<Note | null>(null);
  const noteCache = ref<Note[]>([]);

  // TODO: master add to configurtion file.
  const cacheSize = 10;

  const router = useRouter();
  const authStore = useAuthStore();

  const selectNoteFromCache = async (noteId: string): Promise<Note> => {
    const foundCachedNote = noteCache.value.find((n) => n.id === noteId);
    return foundCachedNote as Note;
  };

  const selectPublicNote = async (
    noteId: string
  ): Promise<ModelsPublicNote> => {
    try {
      return (await sdk.notes.notesIdGet(noteId)).data.data;
    } catch (e: unknown) {
      if ((e as AxiosError).response?.status === 404) {
        router.push({ name: RouteNames.NotFound });
        return;
      }
      // TODO: master handle error here [low]
      console.log('🦄: [line 41][current-note.ts] [35me: ', e);
    }
  };

  const selectMyNote = async (noteId: string): Promise<ModelsPublicNote> => {
    const myNote = (await repositories.notes.getById(
      noteId
    )) as ModelsPublicNote;

    if (!myNote) {
      return;
    }

    myNote.author = authStore.user;
    myNote.isMy = true;
    return myNote;
  };

  const cacheNote = (note: Note) => {
    noteCache.value = [note, ...noteCache.value].slice(0, cacheSize);
  };

  // TODO: master simplify this method
  const selectNoteById = async (noteId: string): Promise<void> => {
    const alreadySelected = currentNote.value?.id === noteId;

    if (alreadySelected) {
      return;
    }

    const cachedValue = await selectNoteFromCache(noteId);
    if (cachedValue) {
      currentNote.value = cachedValue;
      return;
    }

    currentNote.value = null;
    const publicNote =
      (await selectMyNote(noteId)) ?? (await selectPublicNote(noteId));
    const mappedNote = mapRawNoteToNote({
      node: publicNote,
      user: authStore.user,
    });

    cacheNote(mappedNote);

    currentNote.value = mappedNote;
  };

  return {
    currentNote,
    selectNoteById,
  };
});
