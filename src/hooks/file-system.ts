import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';
import { configure } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import fs from '@zenfs/core';

const userFsPrefix = '/user';

export async function configureFileSystem() {
  await configure({
    mounts: {
      [userFsPrefix]: IndexedDB,
    },
  });
}

export function useFileSystem() {
  const currentFs = platformSpecificValue({
    mobile: fs,
    desktop: fs,
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

  const readTextFile = (path: string | string[]): string => {
    return currentFs.readFileSync(normalizePath(path)).toString();
  };

  const writeTextFile = (path: string | string[], content: string) => {
    const realPath = normalizePath(path);
    return currentFs.writeFileSync(realPath, content, 'utf8');
  };

  const getFilesInDir = (path: string | string[] = '/'): string[] => {
    return currentFs.readdirSync(normalizePath(path));
  };

  const rename = (path: string | string[], newPath: string | string[]) => {
    return currentFs.renameSync(normalizePath(path), normalizePath(newPath));
  };

  const isFileExist = (path: string | string[], fileName: string): boolean => {
    const files = getFilesInDir(path);
    return files.includes(fileName);
  };

  const deleteFile = (path: string | string[]) => {
    return currentFs.unlinkSync(normalizePath(path));
  };

  const removeAllFiles = () => {
    currentFs.rmdirSync(userFsPrefix);
    currentFs.mkdirSync(userFsPrefix);
  };

  return {
    readTextFile,
    writeTextFile,
    getFilesInDir,
    rename,
    isFileExist,
    deleteFile,
  };
}
