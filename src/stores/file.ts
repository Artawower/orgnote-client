import { useAuthStore } from './auth';
import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { sleep, uploadFiles } from 'src/tools';

export const useFileStore = defineStore('fileStore', () => {
  const saveFile = async (image: File) => {
    await repositories.files.save(image);
    preserveFiles();
  };

  const getFile = async (name: string) => {
    return repositories.files.getByName(name);
  };

  // TODO: IMPORTANT master delete all stored files when delete note
  const deleteFile = async (name: string) => {
    repositories.files.deleteByName(name);
  };

  const authStore = useAuthStore();

  const preserveFiles = async () => {
    if (authStore.user?.isAnonymous) {
      return;
    }

    let firstFile = await repositories.files.getFirst();
    while (firstFile) {
      if (!firstFile) {
        return;
      }
      try {
        await sdk.files.uploadFile(firstFile);
        await deleteFile(firstFile.name);
        firstFile = await repositories.files.getFirst();
      } catch (e) {
        console.error(e);
        break;
      } finally {
        await sleep(1500);
      }
    }
  };

  const $q = useQuasar();

  const uploadMediaFile = async (): Promise<string> => {
    // Programmatically create input for file upload (image extensions)
    const accept = !$q.platform.is.android ? 'image/*' : undefined;
    const files = await uploadFiles({ accept });
    const file = files[0];
    await saveFile(file);
    return file.name;
  };

  return {
    saveFile,
    getFile,
    deleteFile,
    preserveFiles,
    uploadMediaFile,
  };
});
