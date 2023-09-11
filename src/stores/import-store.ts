import { parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { isOrgFile, readFile, readOrgFile } from 'src/tools';
import { useFileStore } from './file';
import { useNotesStore } from './notes';

export const useNotesImportStore = defineStore('importStore', () => {
  const handleFileEntry = async (fileEntry: FileSystemEntry) => {
    if (isOrgFile(fileEntry.name)) {
      handleOrgFile(fileEntry);
      return;
    }
    handleMediaFile(fileEntry);
  };

  const notesStore = useNotesStore();

  const handleOrgFile = async (fileEntry: FileSystemEntry) => {
    const orgInfo = await readOrgFile(fileEntry);
    const orgTree = withMetaInfo(parse(orgInfo.content));

    if (!orgTree.meta.id) {
      return;
    }

    const now = new Date().toISOString();
    notesStore.upsertNotesLocally([
      {
        content: orgInfo.content,
        id: orgTree.meta.id,
        createdAt: now,
        updatedAt: now,
        filePath: orgInfo.filePath,
        meta: orgTree.meta,
      },
    ]);
  };

  const fileStore = useFileStore();

  const handleMediaFile = async (fileEntry: FileSystemEntry) => {
    console.log('✎: [line 44][import-store.ts] fileEntry: ', fileEntry);
    const file = await readFile(fileEntry);
    await fileStore.saveFile(file);
  };

  const uploadFiles = async (files: FileSystemEntry[]) => {
    files.forEach(async (file) => {
      await handleFileEntry(file);
    });
  };

  return {
    uploadFiles,
  };
});
