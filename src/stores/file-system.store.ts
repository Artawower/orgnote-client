import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';
import { configure } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { useSettingsStore } from 'src/stores/settings';
import { getFileDirPath } from 'src/tools/get-file-dir-path';
import {
  BROWSER_INDEXEDBB_FS_NAME,
  DEFAULT_NOTE_DIR,
} from 'src/constants/default-note-dir.constant';
import { mockDesktop } from 'src/tools/mock-desktop';
import { mockMobile } from 'src/tools/mock-mobile';
import { defineStore } from 'pinia';
import { useEncryption } from 'src/hooks';
import { FileInfo, isOrgGpgFile, join, OrgNoteEncryption } from 'orgnote-api';
import { useOrgNoteApiStore } from './orgnote-api.store';

export const configureFileSystem = mockDesktop(async () => {
  await configure({
    mounts: {
      ['/']: IndexedDB,
    },
  });
});

export const useFileSystemStore = defineStore('file-system', () => {
  const { config } = useSettingsStore();
  const { decrypt, encrypt } = useEncryption();

  const { orgNoteApi } = useOrgNoteApiStore();

  const currentFs = orgNoteApi.core.useFileSystem();

  const normalizePath = (path: string | string[]): string => {
    // TODO: feat/native-file-sync import from orgnote-api
    // const stringPath = getStringPath(path);
    const stringPath = typeof path === 'string' ? path : join(...path);
    return getUserFilePath(stringPath);
  };

  const getUserFilePath = (path: string): string => {
    path = path ? `/${path}` : '';
    return `${getRootDir()}${path}`;
  };

  const getRootDir = () => {
    const fsPrefix = platformSpecificValue({
      desktop: '/',
      // TODO: feat/native-file-sync use vault here
      // data: 'org-notes',
      data: config.vault.path,
    });
    return `${fsPrefix}`;
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

  /*
   * Write file, if file is text and file name is *.org.gpg encrypt it
   */
  const writeFile = async (
    path: string | string[],
    content: string | Uint8Array,
    encryptionConfig?: OrgNoteEncryption
  ) => {
    await initFolderForFile(path);
    const realPath = normalizePath(path);
    encryptionConfig ??= config.encryption;
    const isEncrypted = isOrgGpgFile(realPath);
    const writeContent =
      isEncrypted && typeof content === 'string'
        ? await encrypt(content, 'binary', encryptionConfig)
        : content;
    const format = isEncrypted ? 'binary' : 'utf8';
    return await currentFs.writeFile(realPath, writeContent, format);
  };

  const rename = async (
    path: string | string[],
    newPath: string | string[]
  ): Promise<void> => {
    await initFolderForFile(path);
    return currentFs.rename(normalizePath(path), normalizePath(newPath));
  };

  const isFileExist = async (path: string | string[]): Promise<boolean> => {
    return await currentFs.isFileExist(normalizePath(path));
  };

  const deleteFile = async (path: string | string[]) => {
    await initFolderForFile(path);
    return await currentFs.deleteFile(normalizePath(path));
  };

  const removeAllFiles = async () => {
    await initFolderForFile(config.vault.path);

    await mockMobile(async () => await currentFs.rmdir(config.vault.path))();

    mockDesktop(() => {
      indexedDB.deleteDatabase(BROWSER_INDEXEDBB_FS_NAME);
    })();
  };

  const initFolderForFile = async (
    filePath: string | string[],
    isDir = false
  ): Promise<void> => {
    const realPath = normalizePath(filePath);
    const dirPath = isDir ? realPath : getFileDirPath(realPath) || '/';
    const isDirExist = await currentFs.isDirExist(dirPath);
    if (isDirExist) {
      return;
    }
    await currentFs.mkdir(dirPath);
  };

  const mkdir = async (path: string | string[]): Promise<void> => {
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
    await initFolderForFile(path, true);
    const res = await currentFs.readDir(normalizePath(path));
    const normalizedPaths = normalizeFilePaths(res);
    return normalizedPaths;
  };

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
    return path.replace(config.vault.path + '/', '');
  };

  return {
    readTextFile,
    writeFile,
    rename,
    isFileExist,
    deleteFile,
    removeAllFiles,
    mkdir,
    rmdir,
    fileInfo,
    getRootDir,
    readDir,
  };
});

export const FILE_SYSTEM_MUTATION_ACTIONS: Array<
  keyof ReturnType<typeof useFileSystemStore>
> = ['writeFile', 'rename', 'deleteFile', 'removeAllFiles', 'mkdir', 'rmdir'];
