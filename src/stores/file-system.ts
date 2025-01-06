import { platformSpecificValue } from 'src/utils/platform-specific-value.tool';
import { useSettingsStore } from 'src/stores/settings';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
import { BROWSER_INDEXEDBB_FS_NAME } from 'src/constants/default-note-dir.constant';
import { mockDesktop } from 'src/utils/mock-desktop';
import { mockAndroid, mockMobile } from 'src/utils/mock-mobile';
import { defineStore } from 'pinia';
// import { useEncryption } from 'src/hooks';
import {
  ErrorFileNotFound,
  isOrgGpgFile,
  join,
  OrgNoteEncryption,
  FileSystemStore,
  FileSystem,
  DiskFile,
} from 'orgnote-api';
// import { AndroidFileSystemPermission } from 'src/plugins/android-file-system-permissions.plugin';
import { ref } from 'vue';
import { computed } from 'vue';
import { Platform } from 'quasar';
import { removeRelativePath } from 'src/utils/remove-relative-path';
// import { useRouter } from 'vue-router';

export const useFileSystemStore = defineStore<'file-system', FileSystemStore>('file-system', () => {
  const { config } = useSettingsStore();
  const { decrypt, encrypt } = useEncryption();

  const hasAccess = ref<boolean>(false);
  const accessRequests = ref<boolean>(false);

  const fileSystems = ref<{ [name: string]: FileSystem }>({});
  const activeFileSystemName = ref<string>('');

  const currentFs = computed(() => fileSystems.value[activeFileSystemName.value]);

  // TODO: feat/stable-beta check
  const noVaultProvided = computed(
    () => Platform.is.mobile && Platform.is.android && !config.vault.path,
  );

  const normalizePath = (path: string | string[]): string => {
    path = removeRelativePaths(path);
    const stringPath = typeof path === 'string' ? path : join(...path);
    return getUserFilePath(stringPath);
  };

  const removeRelativePaths = (path: string | string[]): string | string[] => {
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
    encryptionConfig?: OrgNoteEncryption,
  ): Promise<string> => {
    const normalizedPath = normalizePath(path);
    const isEncrypted = isOrgGpgFile(normalizedPath);
    const format = isEncrypted ? undefined : 'utf8';

    const content = await currentFs.value.readFile(normalizedPath, format);
    encryptionConfig ??= config.encryption;

    const text = isEncrypted ? await decrypt(content, 'utf8', encryptionConfig) : content;
    return text;
  };

  const readFile = async (
    path: string | string[],
    encoding?: 'utf8' | 'binary',
  ): Promise<Uint8Array> => {
    const normalizedPath = normalizePath(path);
    return await currentFs.value.readFile(normalizedPath, encoding);
  };

  /*
   * Write file, if file is text and file name is *.org.gpg encrypt it
   */
  const writeFile = async (
    path: string | string[],
    content: string | Uint8Array,
    encryptionConfig?: OrgNoteEncryption,
  ) => {
    const realPath = normalizePath(path);
    encryptionConfig ??= config.encryption;
    const isEncrypted = isOrgGpgFile(realPath);
    const writeContent =
      isEncrypted && typeof content === 'string'
        ? await encrypt(content, 'binary', encryptionConfig)
        : content;
    const format = isEncrypted || content instanceof Uint8Array ? 'binary' : 'utf8';
    return await currentFs.value.writeFile(realPath, writeContent, format);
  };

  const syncFile = async (
    path: string | string[],
    content: string | Uint8Array,
    time: number,
    encryptionConfig?: OrgNoteEncryption,
  ): Promise<string | Uint8Array> => {
    const realPath = normalizePath(path);
    const previousFileInfo = await currentFs.value.fileInfo(realPath);
    const needToUpdate = previousFileInfo.mtime < time;
    const isTextFile = typeof content === 'string';

    if (!needToUpdate && isTextFile) {
      return readTextFile(realPath, encryptionConfig);
    }

    if (!needToUpdate && !isTextFile) {
      return readFile(realPath);
    }

    await writeFile(realPath, content, encryptionConfig);
  };

  const rename = async (path: string | string[], newPath: string | string[]): Promise<void> => {
    return currentFs.value.rename(normalizePath(path), normalizePath(newPath));
  };

  const deleteFile = async (path: string | string[]) => {
    return await currentFs.value.deleteFile(normalizePath(path));
  };

  const removeAllFiles = async () => {
    await mockMobile(async () => await currentFs.value.rmdir(config.vault.path))();

    mockDesktop(() => {
      indexedDB.deleteDatabase(BROWSER_INDEXEDBB_FS_NAME);
    })();
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
    if (noVaultProvided.value) {
      return;
    }

    await currentFs.value.mkdir(normalizePath(path));
  };

  const rmdir = async (path: string | string[]): Promise<void> => {
    await currentFs.value.rmdir(normalizePath(path));
  };

  const fileInfo = async (path: string | string[]): Promise<DiskFile> => {
    const fileInfo = await currentFs.value.fileInfo(normalizePath(path));

    fileInfo.path = platformSpecificValue({
      data: (path: string) => path,
      nativeMobile: (path: string) => normalizeMobilePath(path),
    })(fileInfo.path);

    return fileInfo;
  };

  const readDir = async (path: string | string[] = '') => {
    if (noVaultProvided.value) {
      return [];
    }

    const res = await currentFs.value.readDir(normalizePath(path));
    const normalizedPaths = normalizeFilePaths(res);
    return normalizedPaths;
  };

  // TODO: isolate inside mobile fs.
  const normalizeFilePaths = (paths: DiskFile[]): DiskFile[] => {
    return platformSpecificValue({
      data: (infos: DiskFile[]) => infos,
      nativeMobile: (infos: DiskFile[]) =>
        infos.map((p) => ({
          ...p,
          path: normalizeMobilePath(p.path),
        })),
    })(paths);
  };

  const normalizeMobilePath = (path: string): string => {
    const normalizedPath = path.split(config.vault.path).join('').replaceAll(/^\/+/g, '');
    return normalizedPath;
  };

  // const initFileSystem = async () => {
  //   await mockAndroid(initAndroidFileSystem)();
  // };

  // const router = useRouter();
  const initAndroidFileSystem = async () => {
    // hasAccess.value = (await AndroidFileSystemPermission.hasAccess()).hasAccess;
    // if (hasAccess.value ?? accessRequests.value) {
    //   return;
    // }
    // const giveAccess = await orgNoteApi.interaction.confirm(
    //   'file system access',
    //   'to synchronize existing notes, we need access to the file system',
    // );
    // if (giveAccess) {
    //   hasAccess.value = (await AndroidFileSystemPermission.openAccess()).hasAccess;
    // }
    // accessRequests.value = true;
    // router.push({ name: RouteNames.SynchronisationSettings });
  };

  const getPermissions = async () => {
    // TODO: feat/stable-beta fs method for getting persmissions
    // hasAccess.value = (await AndroidFileSystemPermission.openAccess()).hasAccess;
  };

  const withSafeFolderCreation =
    <PATH extends string | string[], A extends unknown[], R>(
      fn: (p: PATH, ...args: A) => R,
      isDir = false,
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

  const dropFileSystem = async () => {
    // NOTE: ignore native mobile file system.
    if (Platform.is.nativeMobile) {
      return;
    }
    await currentFs.value.rmdir('/');
  };

  const registerFileSystem = (name: string, fs: FileSystem): void => {
    fileSystems.value = {
      ...fileSystems.value,
      [name]: fs,
    };
  };

  const unregisterFileSystem = (name: string): void => {
    delete fileSystems.value[name];
  };

  const pickFileSystem = async (fsName: string): Promise<void> => {
    // TODO: feat/stable-beta migration ?
    activeFileSystemName.value = fsName;
  };

  return {
    readFile: withSafeFolderCreation(readFile),
    readTextFile: withSafeFolderCreation(readTextFile),
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

    pickFileSystem,
    registerFileSystem,
    unregisterFileSystem,

    hasAccess,
    getPermissions,

    activeFileSystemName,
    fileSystems,
  };
});
