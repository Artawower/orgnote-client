import { useFileStore } from './file';
import { useNotesStore } from './notes';
import { parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { isOrgFile, readFile, readOrgFile } from 'src/tools';

export const useNotesImportStore = defineStore('importStore', () => {
  const handleFile = async (file: FileEntry | File) => {
    if (isOrgFile(file.name)) {
      handleOrgFile(file);
      return;
    }
    handleMediaFile(file);
  };

  const notesStore = useNotesStore();

  const handleOrgFile = async (fileEntry: File | FileEntry) => {
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
        touchedAt: now,
        filePath: orgInfo.filePath,
        meta: orgTree.meta as unknown,
      },
    ]);
  };

  const fileStore = useFileStore();

  const handleMediaFile = async (file: File | FileEntry) => {
    if (!(file instanceof File)) {
      file = await readFile(file);
    }
    await fileStore.saveFile(file);
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
