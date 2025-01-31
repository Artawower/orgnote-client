import { join, type DiskFile, type FileManagerStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { useFileSystemStore } from './file-system';
import { getUniqueFileName } from 'src/utils/unique-file-name';

export const useFileManagerStore = defineStore<string, FileManagerStore>('file-manager', () => {
  const path = ref<string>('/');
  const focusFile = shallowRef<DiskFile | null>(null);

  const fs = useFileSystemStore();

  const deleteFile = async (path?: string): Promise<void> => {
    await fs.deleteFile(path ?? focusFile.value?.path);
  };

  const createFile = async (p?: string): Promise<void> => {
    if (p) {
      await fs.writeFile(p, '');
      return;
    }
    const files = (await fs.readDir(path.value)).map((f) => f.name);

    const fileName = getUniqueFileName(files);

    await fs.writeFile(join(path.value, fileName), '');
  };

  const createFolder = async (p?: string): Promise<void> => {
    if (p) {
      await fs.mkdir(p);
      return;
    }

    const files = (await fs.readDir(path.value)).map((f) => f.name);

    const folderName = getUniqueFileName(files, '', 'untitled-folder');

    const folderPath = join(path.value, folderName);
    await fs.mkdir(folderPath);
  };

  const store: FileManagerStore = {
    path,
    focusFile,
    deleteFile,
    createFile,
    createFolder,
  };

  return store;
});
