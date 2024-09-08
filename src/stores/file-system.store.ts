import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';
import { configure } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { FileInfo, FileSystem } from 'src/file-system/file-system.model';
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
import { isOrgGpgFile, OrgNoteEncryption } from 'orgnote-api';

export const configureFileSystem = mockDesktop(async () => {
  await configure({
    mounts: {
      [`/${DEFAULT_NOTE_DIR}`]: IndexedDB,
    },
  });
});

export const useFileSystemStore = defineStore('file-system', () => {
  const { config } = useSettingsStore();
  const { decrypt, encrypt } = useEncryption();

  const currentFs = platformSpecificValue<FileSystem>({
    mobile: mobileFs,
    desktop: browserFs,
  });

  const normalizePath = (path: string | string[]): string => {
    const stringPath = getRealPath(path);
    return getUserFilePath(stringPath);
  };

  const getRealPath = (path: string | string[]): string => {
    if (Array.isArray(path)) {
      return `${path.join('/')}`;
    }
    return path;
  };

  const getUserFilePath = (path: string): string => {
    const browserFsPrefix = platformSpecificValue({ desktop: '/', data: '' });
    return `${browserFsPrefix}${config.vault.path}/${path}`;
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

  return {
    readTextFile,
    writeFile,
    getFilesInDir,
    rename,
    isFileExist,
    deleteFile,
    removeAllFiles,
  };
});
