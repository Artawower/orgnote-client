import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';
import { configure } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { browserFs } from 'src/file-system/browser-fs';
import { mobileFs } from 'src/file-system/mobile-fs';
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
import {
  FileSystem,
  FileInfo,
  isOrgGpgFile,
  OrgNoteEncryption,
} from 'orgnote-api';
import { useOrgNoteApiStore } from './orgnote-api.store';

export const configureFileSystem = mockDesktop(async () => {
  await configure({
    mounts: {
      [`${DEFAULT_NOTE_DIR}`]: IndexedDB,
    },
  });
});

export const useFileSystemStore = defineStore('file-system', () => {
  const { config } = useSettingsStore();
  const { decrypt, encrypt } = useEncryption();

  const { orgNoteApi } = useOrgNoteApiStore();

  const currentFs = orgNoteApi.useFileSystem();

  const normalizePath = (path: string | string[]): string => {
    // TODO: feat/native-file-sync import from orgnote-api
    // const stringPath = getStringPath(path);
    const stringPath = typeof path === 'string' ? path : path.join('/');
    return getUserFilePath(stringPath);
  };

  const getUserFilePath = (path: string): string => {
    return `${getRootDir()}/${path}`;
  };

  const getRootDir = () => {
    const browserFsPrefix = platformSpecificValue({ desktop: '/', data: '' });
    return `${browserFsPrefix}${config.vault.path}`;
  };

  const readTextFile = async (
    path: string | string[],
    encryptionConfig?: OrgNoteEncryption
  ): Promise<string> => {
    console.log('[line 57][REENCRYPTION]: files in dir', await getFilesInDir());
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
    // console.log('✎: [line 77][file-system.store.ts] content: ', content, path);
    await initFolderForFile(path);
    const realPath = normalizePath(path);
    encryptionConfig ??= config.encryption;
    const isEncrypted = isOrgGpgFile(realPath);
    console.log('✎: [line 84][FILE WEIRD] write, realPath: ', realPath);
    const writeContent =
      isEncrypted && typeof content === 'string'
        ? await encrypt(content, 'binary', encryptionConfig)
        : content;
    const format = isEncrypted ? 'binary' : 'utf8';
    return await currentFs.writeFile(realPath, writeContent, format);
  };

  const getFilesInDir = async (
    path: string | string[] = '/'
  ): Promise<FileInfo[]> => {
    await initFolderForFile(path);
    return currentFs.readDir(normalizePath(path));
  };

  const rename = async (
    path: string | string[],
    newPath: string | string[]
  ): Promise<void> => {
    console.log('[line 104][FILE WEIRD]: rename', path, newPath);
    await initFolderForFile(path);
    return currentFs.rename(normalizePath(path), normalizePath(newPath));
  };

  const isFileExist = async (path: string | string[]): Promise<boolean> => {
    console.log(
      '[line 76][FILE SYSTEMS]: norm path',
      path,
      normalizePath(path)
    );

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
    filePath: string | string[]
  ): Promise<void> => {
    const realPath = normalizePath(filePath);
    const dirPath = getFileDirPath(realPath);

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
    return await currentFs.fileInfo(normalizePath(path));
  };

  const readDir = async (path: string | string[]) => {
    const res = await currentFs.readDir(normalizePath(path));
    return res;
  };

  return {
    readTextFile,
    writeFile,
    getFilesInDir,
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
