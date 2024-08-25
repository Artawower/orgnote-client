import { promisify } from 'es6-promisify';
import { FileInfo, FileSystem } from './file-system.model';
import fs, { Dirent, Stats } from '@zenfs/core';

const readFile: FileSystem['readFile'] = async (path: string) => {
  const data = await new Promise<string>((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.toString());
    });
  });
  return data;
};

const writeFile: FileSystem['writeFile'] = async (
  path: string,
  content: string,
  encoding?: string
) => {
  return await new Promise<void>((resolve, reject) => {
    fs.writeFile(path, content, encoding as BufferEncoding, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

const rename: FileSystem['rename'] = async (
  oldPath: string,
  newPath: string
) => {
  await promisify(fs.rename)(oldPath, newPath);
};

const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
  await promisify(fs.unlink)(path);
};

const readDir: FileSystem['readDir'] = async (path: string) => {
  const files = await new Promise<Dirent[]>((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });

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
  await promisify(fs.rmdir)(path);
};

const mkdir: FileSystem['mkdir'] = async (path: string) => {
  await promisify(fs.mkdir)(path, null);
};

export const browserFs: FileSystem = {
  readFile,
  writeFile,
  rename,
  deleteFile,
  readDir,
  rmdir,
  mkdir,
};
