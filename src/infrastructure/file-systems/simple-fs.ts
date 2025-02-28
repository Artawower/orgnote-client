import Dexie from 'dexie';
import type { DiskFile, FileSystem } from 'orgnote-api';
import { ErrorDirectoryNotFound, ErrorFileNotFound, getFileName, splitPath } from 'orgnote-api';
import { extractFileNameFromPath } from 'src/utils/extract-file-name-from-path';
import { getFileDirPath } from 'src/utils/get-file-dir-path';

type File = DiskFile & { content?: string | Uint8Array };

class ErrorDirectoryAlreadyExist extends Error {
  constructor(path: string) {
    super(`Directory already exists: ${path}`);
  }
}

export const SIMPLE_FS_NAME = 'simple-fs';

export const useSimpleFs = (): FileSystem => {
  const db = new Dexie(SIMPLE_FS_NAME);
  const storeName = 'root';
  db.version(1).stores({
    [storeName]: 'path,mtime,ctime,atime,name,type', // Primary key and indexed props
  });
  const fs = db.table<File, string>(storeName);

  const normalizePath = (path: string): string => `${path}`;

  const readFile: FileSystem['readFile'] = async <
    T extends 'utf8' | 'binary' = 'utf8',
    R = T extends 'utf8' ? string : Uint8Array,
  >(
    path: string,
  ): Promise<R> => {
    path = normalizePath(path);
    if (!(await isFileExist(path))) {
      throw new ErrorFileNotFound(path);
    }
    const content = (await fs.get(path)).content as R;
    await fs.update(path, { atime: Date.now() });
    return content;
  };

  const writeFile: FileSystem['writeFile'] = async (
    path: string,
    content: string | Uint8Array,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _encoding: string,
  ) => {
    path = normalizePath(path);
    const existingFile = await fileInfo(path);
    await recursiveMkdir(path);

    await fs.put({
      mtime: Date.now(),
      ctime: existingFile?.ctime ?? Date.now(),
      atime: Date.now(),
      size: new Blob([content]).size,
      name: getFileName(path),
      type: 'file',
      content,
      path,
    });
  };

  const recursiveMkdir = async (path: string) => {
    const paths = splitPath(getFileDirPath(path));
    path = '';
    while (paths.length) {
      path = path + '/' + paths.shift();
      const isDirExist = await isFileExist(path);
      if (isDirExist) {
        continue;
      }
      await mkdir(path);
    }
  };

  const rename: FileSystem['rename'] = async (oldPath: string, newPath: string) => {
    oldPath = normalizePath(oldPath);
    newPath = normalizePath(newPath);

    const renameFilePaths: string[] = [];

    await fs.each((f) => (f.path.startsWith(oldPath) ? renameFilePaths.push(f.path) : null));

    await Promise.all(
      renameFilePaths.map(
        async (p) =>
          await fs.update(p, {
            path: p.replace(oldPath, newPath),
            name: extractFileNameFromPath(newPath),
            mtime: Date.now(),
          }),
      ),
    );
  };

  const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
    path = normalizePath(path);
    await fs.delete(path);
  };

  const readDir: FileSystem['readDir'] = async (path: string) => {
    path = normalizePath(path);

    const fileInfos: DiskFile[] = [];

    await fs.each((f) => {
      const isFirstLevelFile = new RegExp(`^${path}/[^/]+$`).test(f.path);
      if (!isFirstLevelFile) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content, ...fileInfo } = f;
      fileInfos.push(fileInfo);
    });

    return fileInfos;
  };

  const rmdir: FileSystem['rmdir'] = async (path: string) => {
    // NOTE: if path is root
    if (path === '/') {
      await fs.clear();
      await init();
      return;
    }
    if (!(await isDirExist(path))) {
      throw new ErrorDirectoryNotFound(path);
    }
    // TODO: master throw error if file is not dir

    const nestedFilesPaths: string[] = [];
    await fs.each((f) => (f.path.startsWith(path) ? nestedFilesPaths.push(f.path) : null));
    await Promise.all(nestedFilesPaths.map((p) => fs.delete(p)));
  };

  const mkdir: FileSystem['mkdir'] = async (path: string) => {
    path = normalizePath(path);
    if (await isDirExist(path)) {
      throw new ErrorDirectoryAlreadyExist(path);
    }
    // TODO: master update atime/mtime for all parent directories
    await fs.add({
      size: 0,
      mtime: Date.now(),
      ctime: Date.now(),
      atime: Date.now(),
      name: getFileName(path),
      type: 'directory',
      path,
    });
  };

  const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
    path = normalizePath(path);
    return !!(await fs.get(path));
  };

  const isFileExist: FileSystem['isFileExist'] = async (path: string) => {
    path = normalizePath(path);
    return !!(await fs.get(path));
  };

  const utimeSync: FileSystem['utimeSync'] = async (
    path: string,
    atime?: string | number | Date,
    mtime?: string | number | Date,
  ) => {
    path = normalizePath(path);

    await fs.update(path, {
      atime: atime ? new Date(atime).getTime() : undefined,
      mtime: mtime ? new Date(mtime).getTime() : undefined,
    });
  };

  const fileInfo: FileSystem['fileInfo'] = async (path: string) => {
    path = normalizePath(path);
    return fs.get(path);
  };

  const init = async () => {
    await mkdir('/');
  };

  return {
    readFile: readFile,
    fileInfo: fileInfo,
    writeFile: writeFile,
    rename: rename,
    deleteFile: deleteFile,
    readDir: readDir,
    rmdir: rmdir,
    mkdir: mkdir,
    isDirExist: isDirExist,
    isFileExist: isFileExist,
    utimeSync: utimeSync,
    init,
  };
};
