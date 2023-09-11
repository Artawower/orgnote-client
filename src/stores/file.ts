import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { sleep } from 'src/tools';

export const useFileStore = defineStore('fileStore', () => {
  const saveFile = async (image: File) => {
    repositories.files.save(image);
    preserveFiles();
  };

  const getFile = async (name: string) => {
    return repositories.files.getByName(name);
  };

  // TODO: IMPORTANT master delete all stored files when delete note
  const deleteFile = async (name: string) => {
    repositories.files.deleteByName(name);
  };

  const preserveFiles = async () => {
    let firstFile = await repositories.files.getFirst();
    while (firstFile) {
      if (!firstFile) {
        return;
      }
      const rspns = sdk.files.uploadFile(firstFile);
      console.log('✎: [line 24][file.ts] rspns: ', rspns);
      await deleteFile(firstFile.name);
      await sleep(1500);
      firstFile = await repositories.files.getFirst();
    }
  };

  return {
    saveFile,
    getFile,
    deleteFile,
    preserveFiles,
  };
});
