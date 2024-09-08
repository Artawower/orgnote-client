import { FileInfo, FileSystem } from './file-system.model';
import fs, { Dirent, Stats } from '@zenfs/core';

const FILE_NOTE_FOUND_ERROR_CODE = 'ENOENT';

interface BrowserFsError {
  code: string;
}

const readFile: FileSystem['readFile'] = async <T extends 'utf8'>(
  path: string,
  encoding?: T
) => {
  const data = await new Promise<T extends 'utf8' ? string : Uint8Array>(
    (resolve, reject) => {
      if (encoding) {
        fs.readFile(path, { encoding }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data as T extends 'utf8' ? string : Uint8Array);
        });
      }
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data as T extends 'utf8' ? string : Uint8Array);
      });
    }
  );
  return data;
};

const writeFile: FileSystem['writeFile'] = async (
  path: string,
  content: string | Uint8Array,
  encoding?: string
) => {
  return await fs.promises.writeFile(path, content, encoding as BufferEncoding);
};

const rename: FileSystem['rename'] = async (
  oldPath: string,
  newPath: string
) => {
  return await fs.promises.rename(oldPath, newPath);
};

const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
  return await fs.promises.unlink(path);
};

const readDir: FileSystem['readDir'] = async (path: string) => {
  const files = await fs.promises.readdir(path, { withFileTypes: true });
  return files.map(mapFileInfo);
};

const mapFileInfo = (dirent: Dirent): FileInfo => {
  const stats = (dirent as unknown as { stats: Stats }).stats;
  return {
    name: dirent.name,
    type: dirent.isFile() ? 'file' : 'directory',
    size: stats.size,
    atime: stats.atimeMs,
    mtime: stats.mtimeMs,
    ctime: stats.ctimeMs,
  };
};

const rmdir: FileSystem['rmdir'] = async (path: string) => {
  return await fs.promises.rm(path, { recursive: true, force: true });
};

const mkdir: FileSystem['mkdir'] = async (path: string) => {
  await fs.promises.mkdir(path, { recursive: true });
};

const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
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
  try {
    return (await fs.promises.stat(path)).isFile();
  } catch (e) {
    if ((e as BrowserFsError).code === FILE_NOTE_FOUND_ERROR_CODE) {
      return false;
    }
    throw e;
  }
};

export const browserFs: FileSystem = {
  readFile,
  writeFile,
  rename,
  deleteFile,
  readDir,
  rmdir,
  mkdir,
  isDirExist,
  isFileExist,
};
