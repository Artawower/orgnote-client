import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';
import { useSettingsStore } from 'src/stores/settings';
import { getFileDirPath } from 'src/tools/get-file-dir-path';
import { BROWSER_INDEXEDBB_FS_NAME } from 'src/constants/default-note-dir.constant';
import { mockDesktop } from 'src/tools/mock-desktop';
import { mockAndroid, mockMobile } from 'src/tools/mock-mobile';
import { defineStore } from 'pinia';
import { useEncryption } from 'src/hooks';
import {
  ErrorFileNotFound,
  FileInfo,
  isOrgGpgFile,
  join,
  OrgNoteEncryption,
} from 'orgnote-api';
import { useOrgNoteApiStore } from './orgnote-api.store';
import { AndroidFileSystemPermission } from 'src/plugins/android-file-system-permissions.plugin';
import { ref } from 'vue';
import { computed } from 'vue';
import { Platform } from 'quasar';
import { removeRelativePath } from 'src/tools/remove-relative-path';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';

export const useFileSystemStore = defineStore(
  'file-system',
  () => {
    const hasAccess = ref<boolean>(false);
    const accessRequests = ref<boolean>(false);
    const { config } = useSettingsStore();
    const { decrypt, encrypt } = useEncryption();

    const { orgNoteApi } = useOrgNoteApiStore();

    const currentFs = orgNoteApi.core.useFileSystem();

    const noVaultProvided = computed(
      () => Platform.is.mobile && Platform.is.android && !config.vault.path
    );

    const normalizePath = (path: string | string[]): string => {
      path = removeRelativePaths(path);
      const stringPath = typeof path === 'string' ? path : join(...path);
      return getUserFilePath(stringPath);
    };

    const removeRelativePaths = (
      path: string | string[]
    ): string | string[] => {
      if (typeof path === 'string') {
        return removeRelativePath(path);
      }

      return path.map((p) => removeRelativePath(p));
    };

    const getUserFilePath = (path: string): string => {
      path = path ? `/${path}` : '';
      return `${config.vault.path}${path}`;
    };

    const readTextFile = async (
      path: string | string[],
      encryptionConfig?: OrgNoteEncryption
    ): Promise<string> => {
      const normalizedPath = normalizePath(path);
      const isEncrypted = isOrgGpgFile(normalizedPath);
      const format = isEncrypted ? undefined : 'utf8';

      const content = await currentFs.readFile(normalizedPath, format);
      encryptionConfig ??= config.encryption;

      const text = isEncrypted
        ? await decrypt(content, 'utf8', encryptionConfig)
        : content;
      return text;
    };

    const readFile = async (
      path: string | string[],
      encoding?: 'utf8' | 'binary'
    ): Promise<Uint8Array> => {
      const normalizedPath = normalizePath(path);
      return await currentFs.readFile(normalizedPath, encoding);
    };

    /*
     * Write file, if file is text and file name is *.org.gpg encrypt it
     */
    const writeFile = async (
      path: string | string[],
      content: string | Uint8Array,
      encryptionConfig?: OrgNoteEncryption
    ) => {
      const realPath = normalizePath(path);
      encryptionConfig ??= config.encryption;
      const isEncrypted = isOrgGpgFile(realPath);
      const writeContent =
        isEncrypted && typeof content === 'string'
          ? await encrypt(content, 'binary', encryptionConfig)
          : content;
      const format =
        isEncrypted || content instanceof Uint8Array ? 'binary' : 'utf8';
      return await currentFs.writeFile(realPath, writeContent, format);
    };

    const rename = async (
      path: string | string[],
      newPath: string | string[]
    ): Promise<void> => {
      return currentFs.rename(normalizePath(path), normalizePath(newPath));
    };

    const isFileExist = async (path: string | string[]): Promise<boolean> => {
      return await currentFs.isFileExist(normalizePath(path));
    };

    const deleteFile = async (path: string | string[]) => {
      return await currentFs.deleteFile(normalizePath(path));
    };

    const removeAllFiles = async () => {
      await mockMobile(async () => await currentFs.rmdir(config.vault.path))();

      mockDesktop(() => {
        indexedDB.deleteDatabase(BROWSER_INDEXEDBB_FS_NAME);
      })();
    };

    const initFolderForFile = async (
      filePath: string | string[],
      isDir = false
    ): Promise<void> => {
      if (noVaultProvided.value) {
        return;
      }
      const realPath = normalizePath(filePath);
      const dirPath = isDir ? realPath : getFileDirPath(realPath) || '';
      const isDirExist = await currentFs.isDirExist(dirPath);
      if (isDirExist) {
        return;
      }
      try {
        await currentFs.mkdir(dirPath);
      } catch (e) {
        throw e;
      }
    };

    const mkdir = async (path: string | string[]): Promise<void> => {
      if (noVaultProvided.value) {
        return;
      }

      await currentFs.mkdir(normalizePath(path));
    };

    const rmdir = async (path: string | string[]): Promise<void> => {
      await currentFs.rmdir(normalizePath(path));
    };

    const fileInfo = async (path: string | string[]): Promise<FileInfo> => {
      const fileInfo = await currentFs.fileInfo(normalizePath(path));

      fileInfo.path = platformSpecificValue({
        data: (path: string) => path,
        mobile: (path: string) => normalizeMobilePath(path),
      })(fileInfo.path);

      return fileInfo;
    };

    const readDir = async (path: string | string[] = '') => {
      if (noVaultProvided.value) {
        return [];
      }

      const res = await currentFs.readDir(normalizePath(path));
      const normalizedPaths = normalizeFilePaths(res);
      return normalizedPaths;
    };

    // TODO: isolate inside mobile fs.
    const normalizeFilePaths = (paths: FileInfo[]): FileInfo[] => {
      return platformSpecificValue({
        data: (infos: FileInfo[]) => infos,
        mobile: (infos: FileInfo[]) =>
          infos.map((p) => ({
            ...p,
            path: normalizeMobilePath(p.path),
          })),
      })(paths);
    };

    const normalizeMobilePath = (path: string): string => {
      return path.replaceAll(config.vault.path, '').replaceAll(/^\/+/g, '');
    };

    const initFileSystem = async () => {
      await mockAndroid(initAndroidFileSystem)();
    };

    const router = useRouter();
    const initAndroidFileSystem = async () => {
      hasAccess.value = (
        await AndroidFileSystemPermission.hasAccess()
      ).hasAccess;
      if (hasAccess.value ?? accessRequests.value) {
        return;
      }

      const giveAccess = await orgNoteApi.interaction.confirm(
        'file system access',
        'to synchronize existing notes, we need access to the file system'
      );

      if (giveAccess) {
        hasAccess.value = (
          await AndroidFileSystemPermission.openAccess()
        ).hasAccess;
      }

      accessRequests.value = true;
      router.push({ name: RouteNames.SynchronisationSettings });
    };

    const openPermissions = async () => {
      hasAccess.value = (
        await AndroidFileSystemPermission.openAccess()
      ).hasAccess;
    };

    const withSafeFolderCreation =
      <PATH extends string | string[], A extends unknown[], R>(
        fn: (p: PATH, ...args: A) => R,
        isDir = false
      ) =>
      async (path?: PATH, ...args: A): Promise<Awaited<R>> => {
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

    return {
      readTextFile: withSafeFolderCreation(readTextFile),
      readFile: withSafeFolderCreation(readFile),
      writeFile: withSafeFolderCreation(writeFile),
      rename: withSafeFolderCreation(rename),
      isFileExist,
      deleteFile: withSafeFolderCreation(deleteFile),
      removeAllFiles,
      mkdir: withSafeFolderCreation(mkdir),
      rmdir: withSafeFolderCreation(rmdir, true),
      fileInfo: withSafeFolderCreation(fileInfo),
      readDir: withSafeFolderCreation(readDir),

      initFileSystem,
      hasAccess,
      openPermissions,
    };
  },
  { persist: true }
);

export const FILE_SYSTEM_MUTATION_ACTIONS: Array<
  keyof ReturnType<typeof useFileSystemStore>
> = ['writeFile', 'rename', 'deleteFile', 'removeAllFiles', 'mkdir', 'rmdir'];
