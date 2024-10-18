import { FileInfo, FileSystem, getFileName } from 'orgnote-api';
import fs, { Stats } from '@zenfs/core';

const FILE_NOTE_FOUND_ERROR_CODE = 'ENOENT';

interface BrowserFsError {
  code: string;
}

export const useBrowserFs = () => {
  const normalizePath = (path: string): string => `/${path}`;

  const readFile: FileSystem['readFile'] = async <
    T extends 'utf8' | 'binary' = 'utf8',
    R = T extends 'utf8' ? string : Uint8Array,
  >(
    path: string,
    encoding?: T
  ): Promise<R> => {
    path = normalizePath(path);
    encoding = encoding === 'binary' ? undefined : encoding;
    const data = await new Promise<R>((resolve, reject) => {
      if (encoding) {
        fs.readFile(path, { encoding }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data as R);
        });
      }
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data as R);
      });
    });
    return data;
  };

  const writeFile: FileSystem['writeFile'] = async (
    path: string,
    content: string | Uint8Array,
    encoding: string
  ) => {
    path = normalizePath(path);

    return await fs.promises.writeFile(
      path,
      content,
      encoding as BufferEncoding
    );
  };

  const rename: FileSystem['rename'] = async (
    oldPath: string,
    newPath: string
  ) => {
    return await fs.promises.rename(oldPath, newPath);
  };

  const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
    path = normalizePath(path);

    return await fs.promises.unlink(path);
  };

  const readDir: FileSystem['readDir'] = async (path: string) => {
    path = normalizePath(path);

    const files = await fs.promises.readdir(path, { withFileTypes: true });
    return files.map((dirent) =>
      mapFileInfo((dirent as unknown as { stats: Stats }).stats, dirent.path)
    );
  };

  const mapFileInfo = (stats: Stats, path: string): FileInfo => {
    path = normalizePath(path);

    return {
      path,
      name: getFileName(path),
      type: stats.isFile() ? 'file' : 'directory',
      size: stats.size,
      atime: stats.atimeMs,
      mtime: stats.mtimeMs,
      ctime: stats.ctimeMs,
    };
  };

  const rmdir: FileSystem['rmdir'] = async (path: string) => {
    path = normalizePath(path);

    return await fs.promises.rm(path, { recursive: true, force: true });
  };

  const mkdir: FileSystem['mkdir'] = async (path: string) => {
    path = normalizePath(path);

    await fs.promises.mkdir(path, { recursive: true });
  };

  const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
    path = normalizePath(path);

    try {
      return (await fs.promises.stat(path)).isDirectory();
    } catch (e) {
      if ((e as BrowserFsError).code === FILE_NOTE_FOUND_ERROR_CODE) {
        return false;
      }
      throw e;
    }
  };

  const isFileExist: FileSystem['isFileExist'] = async (path: string) => {
    path = normalizePath(path);

    try {
      return (await fs.promises.stat(path)).isFile();
    } catch (e) {
      if ((e as BrowserFsError).code === FILE_NOTE_FOUND_ERROR_CODE) {
        return false;
      }
      throw e;
    }
  };

  const utimeSync: FileSystem['utimeSync'] = async (
    path: string,
    atime?: string | number | Date,
    mtime?: string | number | Date
  ) => {
    path = normalizePath(path);

    const fi = await fileInfo(path);
    atime ??= fi.atime;
    mtime ??= fi.mtime;
    await fs.promises.utimes(path, atime, mtime);
  };

  const fileInfo: FileSystem['fileInfo'] = async (path: string) => {
    path = normalizePath(path);

    const stats = await fs.promises.stat(path);

    return mapFileInfo(stats, path);
  };

  return {
    readFile,
    fileInfo,
    writeFile,
    rename,
    deleteFile,
    readDir,
    rmdir,
    mkdir,
    isDirExist,
    isFileExist,
    utimeSync,
  };
};
