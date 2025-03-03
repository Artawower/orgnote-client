import { defineStore } from 'pinia';
import type { FileSystemStore, DiskFile } from 'orgnote-api';
import { ErrorFileNotFound, isOrgGpgFile, join } from 'orgnote-api';
import { computed, ref } from 'vue';
import { Platform } from 'quasar';
import { removeRelativePath } from 'src/utils/remove-relative-path';
import { desktopOnly, mobileOnly } from 'src/utils/platform-specific';
import { BROWSER_INDEXEDBB_FS_NAME } from 'src/constants/indexeddb-fs-name';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
import { platformSpecificValue } from 'src/utils/platform-specific-value';
import { storeToRefs } from 'pinia';
import { useFileSystemManagerStore } from './file-system-manager';
import { watch } from 'vue';

export const useFileSystemStore = defineStore<'file-system', FileSystemStore>(
  'file-system',
  () => {
    const { currentFs, currentFsInfo } = storeToRefs(useFileSystemManagerStore());
    const vault = ref<string>(currentFsInfo.value?.initialVault);

    watch(currentFsInfo, () => {
      vault.value = currentFsInfo.value?.initialVault;
    });

    const normalizePath = (path: string | string[]): string => {
      path = removeRelativePaths(path);
      path = removeStartSlash(path);
      const stringPath = typeof path === 'string' ? path : join(...path);
      return getUserFilePath(stringPath);
    };

    const noVaultProvided = computed(() => vault.value == null);

    const removeRelativePaths = (path: string | string[]): string | string[] => {
      if (typeof path === 'string') {
        return removeRelativePath(path);
      }

      return path.map((p) => removeRelativePath(p));
    };

    const removeStartSlash = (path: string | string[]): string | string[] => {
      if (typeof path === 'string') {
        return path.startsWith('/') ? path.slice(1) : path;
      }

      return path.map((p) => (p.startsWith('/') ? p.slice(1) : p));
    };

    const getUserFilePath = (path: string): string => {
      path = path ? `/${path}` : '';
      return `${vault.value ?? ''}${path}`;
    };

    const readFile = async <T extends 'utf8' | 'binary'>(
      path: string | string[],
      encoding?: T,
    ): Promise<T extends 'utf8' ? string : Uint8Array> => {
      const normalizedPath = normalizePath(path);
      return await currentFs.value.readFile(normalizedPath, encoding);
    };

    const writeFile = async (path: string | string[], content: string | Uint8Array) => {
      const realPath = normalizePath(path);
      const isEncrypted = isOrgGpgFile(realPath);
      const format = isEncrypted || content instanceof Uint8Array ? 'binary' : 'utf8';
      return await currentFs.value.writeFile(realPath, content, format);
    };

    const syncFile = async <T extends string | Uint8Array>(
      path: string | string[],
      content: T,
      time: number,
    ): Promise<T> => {
      const realPath = normalizePath(path);
      const previousFileInfo = await currentFs.value.fileInfo(realPath);
      const needToUpdate = previousFileInfo?.mtime < time;

      if (previousFileInfo && !needToUpdate) {
        return readFile(realPath) as unknown as T;
      }

      await writeFile(realPath, content);
    };

    const rename = async (path: string | string[], newPath: string | string[]): Promise<void> => {
      return currentFs.value.rename(normalizePath(path), normalizePath(newPath));
    };

    const deleteFile = async (path: string | string[]) => {
      return await currentFs.value.deleteFile(normalizePath(path));
    };

    const removeAllFiles = async () => {
      await mobileOnly(async () => await currentFs.value.rmdir(vault.value))();
      desktopOnly(indexedDB.deleteDatabase)(BROWSER_INDEXEDBB_FS_NAME);
    };

    const initFolderForFile = async (filePath: string | string[], isDir = false): Promise<void> => {
      if (noVaultProvided.value) {
        return;
      }
      const realPath = normalizePath(filePath);
      const dirPath = isDir ? realPath : getFileDirPath(realPath) || '';
      const isDirExist = await currentFs.value.isDirExist(dirPath);
      if (isDirExist) {
        return;
      }
      try {
        await currentFs.value.mkdir(dirPath);
      } catch (e) {
        // TODO: feat/stable-beta  logger here
        console.warn('✎: [line 133][file-system.ts<stores>] e: ', e);
        throw e;
      }
    };

    const mkdir = async (path: string | string[]): Promise<void> => {
      await currentFs.value.mkdir(normalizePath(path));
    };

    const rmdir = async (path: string | string[]): Promise<void> => {
      await currentFs.value.rmdir(normalizePath(path));
    };

    const fileInfo = async (path: string | string[]): Promise<DiskFile> => {
      const fileInfo = await currentFs.value.fileInfo(normalizePath(path));

      if (!fileInfo) {
        return;
      }

      fileInfo.path = platformSpecificValue({
        data: (path: string) => path,
        nativeMobile: (path: string) => normalizeMobilePath(path),
      })(fileInfo.path);

      return fileInfo;
    };

    const readDir = async (path: string | string[] = ''): Promise<DiskFile[]> => {
      if (noVaultProvided.value) {
        return [];
      }

      const res = await currentFs.value.readDir(normalizePath(path));
      return res;
      // const normalizedPaths = normalizeFilePaths(res);
      // return normalizedPaths;
    };

    // // TODO: isolate inside mobile fs.
    // const normalizeFilePaths = (paths: DiskFile[]): DiskFile[] => {
    //   return platformSpecificValue({
    //     data: (infos: DiskFile[]) => infos,
    //     nativeMobile: (infos: DiskFile[]) =>
    //       infos.map((p) => ({
    //         ...p,
    //         path: normalizeMobilePath(p.path),
    //       })),
    //   })(paths);
    // };

    const normalizeMobilePath = (path: string): string => {
      const normalizedPath = path.split(vault.value).join('').replaceAll(/^\/+/g, '');
      return normalizedPath;
    };

    const withSafeFolderCreation =
      <PATH extends string | string[], A extends unknown[], R>(
        fn: (p: PATH, ...args: A) => R,
        isDir = false,
      ) =>
      async (path?: PATH, ...args: A): Promise<Awaited<R>> => {
        if (!currentFs.value) {
          return;
        }
        try {
          return await fn(path, ...args);
        } catch (e) {
          if (!(e instanceof ErrorFileNotFound)) {
            throw e;
          }
          await initFolderForFile(path, isDir);
          return await fn(path, ...args);
        }
      };

    const dropFileSystem = async () => {
      // NOTE: ignore native mobile file system.
      if (Platform.is.nativeMobile) {
        return;
      }
      await currentFs.value.rmdir('/');
    };

    const store: FileSystemStore = {
      readFile: withSafeFolderCreation(readFile),
      writeFile: withSafeFolderCreation(writeFile),
      syncFile: withSafeFolderCreation(syncFile),
      rename: withSafeFolderCreation(rename),
      deleteFile: withSafeFolderCreation(deleteFile),
      removeAllFiles,
      mkdir: withSafeFolderCreation(mkdir),
      rmdir: withSafeFolderCreation(rmdir, true),
      fileInfo: withSafeFolderCreation(fileInfo),
      readDir: withSafeFolderCreation(readDir),
      dropFileSystem,
      vault,
    };

    return store;
  },
  {
    persist: {
      pick: ['vault'],
    },
  },
);
