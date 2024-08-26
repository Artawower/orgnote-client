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
  return (await fs.promises.stat(path)).isDirectory();
};

const isFileExist: FileSystem['isFileExist'] = async (path: string) => {
  return (await fs.promises.stat(path)).isFile();
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
