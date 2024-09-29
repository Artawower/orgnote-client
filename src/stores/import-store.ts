import { useExtensionsStore } from './extensions';
import { useNotesStore } from './notes';
import { parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { useFileSystemStore } from 'src/stores/file-system.store';
import { RouteNames } from 'src/router/routes';
import { isOrgFile, readExtension, readFile, readOrgFile } from 'src/tools';
import { useRouter } from 'vue-router';
import { useOrgNoteApiStore } from './orgnote-api.store';

export const useNotesImportStore = defineStore('importStore', () => {
  const notesStore = useNotesStore();
  const extensionStore = useExtensionsStore();
  const router = useRouter();
  const { writeFile: writeTextFile } = useFileSystemStore();

  const { orgNoteApi } = useOrgNoteApiStore();
  const filesStore = orgNoteApi.core.useSyncStore();

  const handleFile = async (file: FileEntry | File) => {
    if (isOrgFile(file.name)) {
      handleOrgFile(file);
      return;
    }
    if (await handleExtensionFile(file)) {
      return;
    }
    handleMediaFile(file);
  };

  const handleExtensionFile = async (
    file: File | FileEntry
  ): Promise<boolean> => {
    if (!file.name.endsWith('.js')) {
      return;
    }
    file = (file as FileEntry).file
      ? await readFile(file as FileEntry)
      : (file as File);
    try {
      const ext = await readExtension(file);
      await extensionStore.uploadExtension(ext);
      router.push({ name: RouteNames.Extensions });
      return true;
    } catch (e) {
      return;
    }
  };

  const handleOrgFile = async (fileEntry: File | FileEntry) => {
    const orgInfo = await readOrgFile(fileEntry);
    const orgTree = withMetaInfo(parse(orgInfo.content));

    if (!orgTree.meta.id) {
      return;
    }

    const now = new Date().toISOString();
    writeTextFile(orgInfo.filePath, orgInfo.content);
    notesStore.upsertNotesLocally([
      {
        id: orgTree.meta.id,
        createdAt: now,
        updatedAt: now,
        touchedAt: now,
        filePath: orgInfo.filePath,
        meta: orgTree.meta as unknown,
      },
    ]);
  };

  const handleMediaFile = async (file: File | FileEntry) => {
    if (!(file instanceof File)) {
      file = await readFile(file);
    }
    // TODO: feat/native-file-sync import does not work
    // await filesStore.saveFile(file);
  };

  const uploadFiles = async (files: FileEntry[] | FileList) => {
    const unwrappedFiles =
      files instanceof FileList ? Array.from(files) : files;

    unwrappedFiles.forEach(async (file) => {
      await handleFile(file);
    });
  };

  return {
    uploadFiles,
  };
});
