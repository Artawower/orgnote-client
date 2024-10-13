import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { sleep, uploadFiles } from 'src/tools';
import { useOrgNoteApiStore } from './orgnote-api.store';
import { FilesStore } from 'orgnote-api/models';
import { repositories } from 'src/boot/repositories';
import { sdk } from 'src/boot/axios';
import { getFileExtension, getFileName, join } from 'orgnote-api';
import { useFileSystemStore } from './file-system.store';

export const useFilesStore = defineStore<string, FilesStore>(
  'fileStore',
  () => {
    const $q = useQuasar();

    const { orgNoteApi } = useOrgNoteApiStore();
    const fileSystemStore = useFileSystemStore();
    const uploadMediaFile = async (path?: string): Promise<string> => {
      path ||= '/';
      // Programmatically create input for file upload (image extensions)
      const accept = !$q.platform.is.android ? 'image/*' : undefined;
      const files = await uploadFiles({ accept });
      const file = files[0];

      path = join(path, file.name);

      await saveFile(path, file);
      await repositories.files.upsert({
        fileName: file.name,
        filePath: path,
        fileExtension: getFileExtension(file.name),
        size: file.size,
        updatedAt: new Date(),
        touchedAt: new Date(),
      });
      preserveFiles();
      return path;
    };

    const getBlobUrl = async (filePath: string): Promise<string> => {
      filePath = filePath.slice(2, filePath.length);
      try {
        const file = await fileSystemStore.readFile(filePath, 'binary');
        const url = URL.createObjectURL(new Blob([file], { type: 'image' }));
        return url;
      } catch (e) {
        if (!authStore.user || authStore.user.isAnonymous) {
          return;
        }
        throw e;
        const fileName = getFileName(filePath);
        const blob = await sdk.files.downloadFile(authStore.user.id, fileName);
        const file = new File([blob], fileName);
        await saveFile(filePath, file);
        return URL.createObjectURL(blob);
      }
    };

    const saveFile = async (path: string, file: File): Promise<void> => {
      const content = new Uint8Array(await file.arrayBuffer());
      await fileSystemStore.writeFile(path, content);
    };

    const authStore = orgNoteApi.core.useAuthStore();

    const preserveFiles = async () => {
      if (authStore.user?.isAnonymous) {
        return;
      }

      let firstFile = await repositories.files.getFirstUnuploaded();
      while (firstFile) {
        if (!firstFile) {
          return;
        }
        try {
          const fileName = getFileName(firstFile.filePath);
          const localFile = await fileSystemStore.readFile(firstFile.filePath);
          const blob = new Blob([localFile]);
          const file = new File([blob], fileName, {
            lastModified: new Date().getTime(),
          });
          await sdk.files.uploadFile(file);
          await repositories.files.update(firstFile.filePath, {
            uploaded: true,
          });
          firstFile = await repositories.files.getFirstUnuploaded();
        } catch (e) {
          console.error(e);
          break;
        } finally {
          await sleep(1500);
        }
      }
    };

    return {
      uploadMediaFile,
      getBlobUrl,
    };
  }
);
