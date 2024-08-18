import { Note } from 'orgnote-api';
import { useAuthStore } from './auth';
import { useNotesStore } from './notes';
import { parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { ModelsNoteMeta } from 'src/generated/api';
import { RouteNames } from 'src/router/routes';
import { getFileNameWithoutExtension, getInitialNoteTemplate } from 'src/tools';
import { v4 } from 'uuid';
import { useRouter } from 'vue-router';
import { useSettingsStore } from './settings';

export const useNoteCreatorStore = defineStore('noteCreatorStore', () => {
  // TODO: master template list for plugins.

  const initNote = (note: Partial<Note>): Note => {
    const now = new Date().toISOString();
    return {
      createAt: now,
      updateAt: now,
      ...note,
    } as Note;
  };

  const notesStore = useNotesStore();
  const router = useRouter();
  const authStore = useAuthStore();
  const { config } = useSettingsStore();

  const create = async (id?: string, filePath?: string[]) => {
    id ??= v4();
    filePath ??= ['Untitled.org'];
    const noteName = filePath[filePath.length - 1];
    const content = getInitialNoteTemplate(
      id,
      getFileNameWithoutExtension(noteName)
    );
    const parsedNote = withMetaInfo(parse(content));
    const note = initNote({
      id,
      filePath,
      isMy: true,
      author: { id: authStore.user.id },
      touchedAt: new Date().toISOString(),
      meta: parsedNote.meta as ModelsNoteMeta,
      encryptionType: config.encryption.type,
    });
    await notesStore.upsertNotesLocally([note]);
    router.push({
      name: RouteNames.EditNote,
      params: { id: note.id },
    });
  };

  return {
    create,
  };
});
