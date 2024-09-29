import { Note, getFileNameWithoutExtension } from 'orgnote-api';
import { useAuthStore } from './auth';
import { useNotesStore } from './notes';
import { parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { ModelsNoteMeta } from 'src/generated/api';
import { RouteNames } from 'src/router/routes';
import { getInitialNoteTemplate, getUniqueFileName } from 'src/tools';
import { v4 } from 'uuid';
import { useRouter } from 'vue-router';
import { useSettingsStore } from './settings';
import { useFileSystemStore } from 'src/stores/file-system.store';

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
  const fileSystem = useFileSystemStore();
  const { config } = useSettingsStore();

  const create = async ({
    id,
    fileName,
    filePath = [],
  }: {
    id?: string;
    fileName?: string;
    filePath?: string[];
  } = {}) => {
    id ??= v4();

    const existingFileNames = await getFileNamesInDir(fileName);
    const uniqueFileName = getUniqueFileName(
      existingFileNames,
      '.org',
      fileName
    );

    filePath = [...filePath, uniqueFileName];
    const noteName = filePath[filePath.length - 1];
    const content = getInitialNoteTemplate(
      id,
      getFileNameWithoutExtension(noteName)
    );
    await fileSystem.writeFile(filePath, content);
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

  const getFileNamesInDir = async (dirPath: string): Promise<string[]> => {
    const existingFiles = await fileSystem.readDir(dirPath);
    return existingFiles.map((fi) => fi.name);
  };

  return {
    create,
  };
});
