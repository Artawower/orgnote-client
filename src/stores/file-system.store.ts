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

export const configureFileSystem = mockDesktop(async () => {
  await configure({
    mounts: {
      [`/${DEFAULT_NOTE_DIR}`]: IndexedDB,
    },
  });
});

export const useFileSystemStore = defineStore('file-system', () => {
  const { config } = useSettingsStore();

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

  const readTextFile = async (path: string | string[]): Promise<string> => {
    return (await currentFs.readFile(normalizePath(path))).toString();
  };

  const writeTextFile = async (path: string | string[], content: string) => {
    await initFolderForFile(path);
    const realPath = normalizePath(path);
    return await currentFs.writeFile(realPath, content, 'utf8');
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
    writeTextFile,
    getFilesInDir,
    rename,
    isFileExist,
    deleteFile,
    removeAllFiles,
  };
});
