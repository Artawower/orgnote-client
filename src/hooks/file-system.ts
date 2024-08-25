import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';
import { configure } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Filesystem } from '@capacitor/filesystem';
import { FileInfo, FileSystem } from 'src/file-system/file-system.model';
import { browserFs } from 'src/file-system/browser-fs';
import { mobileFs } from 'src/file-system/mobile-fs';

const userFsPrefix = '/user';

export async function configureFileSystem() {
  await configure({
    mounts: {
      [userFsPrefix]: IndexedDB,
    },
  });
}

export function useFileSystem() {
  const currentFs = platformSpecificValue<FileSystem>({
    mobile: mobileFs,
    desktop: browserFs,
  });

  const normalizePath = (path: string | string[]): string => {
    const stringPath = getRealPath(path);
    return useUserFsFolder(stringPath);
  };

  const getRealPath = (path: string | string[]): string => {
    if (Array.isArray(path)) {
      return `${path.join('/')}`;
    }
    return path;
  };

  const useUserFsFolder = (path: string): string => {
    return `${userFsPrefix}/${path}`;
  };

  const readTextFile = async (path: string | string[]): Promise<string> => {
    return (await currentFs.readFile(normalizePath(path))).toString();
  };

  const writeTextFile = async (path: string | string[], content: string) => {
    const realPath = normalizePath(path);
    return await currentFs.writeFile(realPath, content, 'utf8');
  };

  const getFilesInDir = async (
    path: string | string[] = '/'
  ): Promise<FileInfo[]> => {
    return currentFs.readDir(normalizePath(path));
  };

  const rename = async (
    path: string | string[],
    newPath: string | string[]
  ): Promise<void> => {
    return currentFs.rename(normalizePath(path), normalizePath(newPath));
  };

  const isFileExist = async (
    path: string | string[],
    fileName: string
  ): Promise<boolean> => {
    Filesystem.writeFile;
    const files = await getFilesInDir(path);
    return files.some((fn) => fn.name === fileName);
  };

  const deleteFile = (path: string | string[]) => {
    return currentFs.deleteFile(normalizePath(path));
  };

  // TODO: feat/native-file-sync call when clear storage.
  const removeAllFiles = () => {
    currentFs.rmdir(userFsPrefix);
    currentFs.mkdir(userFsPrefix);
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
}
