import { AxiosError } from 'axios';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { ModelsPublicNote } from 'src/generated/api';
import { Note } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './auth';
import { defineStore } from 'pinia';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';

type ParsedNote = { note: Note; orgTree: OrgNode };

export const useCurrentNoteStore = defineStore('current-note', () => {
  const currentNote = ref<Note | null>(null);
  const noteCache = ref<ParsedNote[]>([]);
  const currentOrgTree = ref<OrgNode | null>(null);

  // TODO: master add to configuration file.
  const cacheSize = 10;

  const router = useRouter();
  const authStore = useAuthStore();

  const selectNoteFromCache = async (noteId: string): Promise<ParsedNote> => {
    const foundParsedNote = noteCache.value.find((pn) => pn.note.id === noteId);
    return foundParsedNote as ParsedNote;
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

  const cacheNote = (parsedNote: ParsedNote) => {
    noteCache.value = [parsedNote, ...noteCache.value].slice(0, cacheSize);
  };

  const selectNoteById = async (noteId: string): Promise<void> => {
    const alreadySelected = currentNote.value?.id === noteId;

    if (alreadySelected) {
      return;
    }

    const cachedValue = await selectNoteFromCache(noteId);
    if (cachedValue) {
      currentNote.value = cachedValue.note;
      currentOrgTree.value = cachedValue.orgTree;
      return;
    }

    currentNote.value = null;
    const publicNote =
      (await selectMyNote(noteId)) ?? (await selectPublicNote(noteId));

    const orgTree = withMetaInfo(parse(publicNote.content));

    const parsedNote: ParsedNote = { note: publicNote, orgTree };

    cacheNote(parsedNote);

    currentNote.value = publicNote;
    currentOrgTree.value = orgTree;
  };

  return {
    currentNote,
    selectNoteById,
  };
});
