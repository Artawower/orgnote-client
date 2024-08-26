import {
  Filesystem,
  Encoding,
  FileInfo as CapacitorFileInfo,
  Directory,
} from '@capacitor/filesystem';
import { FileInfo, FileSystem } from './file-system.model';

const FILE_NOT_FOUND_ERR = 'File does not exist';
const DIRECTORY_NOT_FOUND_ERR = 'Directory does not exist';

const readFile: FileSystem['readFile'] = async (path: string) => {
  const data = (
    await Filesystem.readFile({
      directory: Directory.Documents,
      path,
      encoding: Encoding.UTF8,
    })
  ).data;
  if (typeof data === 'string') {
    return data;
  }
  return await data.text();
};

const writeFile: FileSystem['writeFile'] = async (
  path: string,
  content: string,
  encoding: BufferEncoding
) => {
  await Filesystem.writeFile({
    path,
    directory: Directory.Documents,
    data: content,
    encoding: encoding as unknown as Encoding,
  });
};

const rename: FileSystem['rename'] = async (
  oldPath: string,
  newPath: string
) => {
  await Filesystem.rename({
    from: oldPath,
    to: newPath,
    directory: Directory.Documents,
  });
};

const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
  await Filesystem.deleteFile({
    directory: Directory.Documents,

    path,
  });
};

const readDir: FileSystem['readDir'] = async (path: string) => {
  const res = await Filesystem.readdir({
    directory: Directory.Documents,
    path,
  });

  return res.files.map(mapFileInfo);
};

const mapFileInfo = (file: CapacitorFileInfo): FileInfo => ({
  name: file.name,
  type: file.type,
  size: file.size,
  mtime: file.mtime,
  uri: file.uri,
  ctime: file.ctime,
});

const rmdir: FileSystem['rmdir'] = async (path: string) => {
  await Filesystem.rmdir({
    directory: Directory.Documents,
    recursive: true,
    path,
  });
};

const mkdir: FileSystem['mkdir'] = async (path: string) => {
  await Filesystem.mkdir({
    directory: Directory.Documents,
    path,
  });
};

const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
  try {
    await Filesystem.readdir({
      directory: Directory.Documents,
      path,
    });
    return true;
  } catch (e) {
    if ((e as { message: string }).message !== DIRECTORY_NOT_FOUND_ERR) {
      throw e;
    }
    return false;
  }
};

const isFileExist: FileSystem['isFileExist'] = async (path: string) => {
  try {
    await Filesystem.stat({
      directory: Directory.Documents,
      path,
    });
    return true;
  } catch (e) {
    if ((e as { message: string }).message !== FILE_NOT_FOUND_ERR) {
      throw e;
    }
    return false;
  }
};

export const mobileFs: FileSystem = {
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
