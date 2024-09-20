import {
  Filesystem,
  Encoding,
  FileInfo as CapacitorFileInfo,
  Directory,
  StatResult,
} from '@capacitor/filesystem';
import { FileInfo, FileSystem, getFileName } from 'orgnote-api';

const FILE_NOT_FOUND_ERR = 'File does not exist';
const DIRECTORY_NOT_FOUND_ERR = 'Directory does not exist';

const readFile: FileSystem['readFile'] = async <T extends 'utf8'>(
  path: string,
  encoding?: T
): Promise<T extends 'utf8' ? string : Uint8Array> => {
  const data = (
    await Filesystem.readFile({
      directory: Directory.Documents,
      path,
      encoding: encoding as unknown as Encoding,
    })
  ).data;

  if (typeof data === 'string') {
    return data as T extends 'utf8' ? string : Uint8Array;
  }

  const res = await data.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  return res as T extends 'utf8' ? string : Uint8Array;
};

const writeFile: FileSystem['writeFile'] = async (
  path: string,
  content: string | Uint8Array,
  encoding: BufferEncoding
) => {
  const data = typeof content === 'string' ? content : new Blob([content]);
  await Filesystem.writeFile({
    path,
    directory: Directory.Documents,
    data,
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

  return res.files.map((f) => mapFileInfo(f, `${path}/${f.name}`));
};

const mapFileInfo = (
  file: CapacitorFileInfo | StatResult,
  path: string
): FileInfo => ({
  path,
  name: getFileName(path),
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

const fileInfo: FileSystem['fileInfo'] = async (path: string) => {
  const stat = await Filesystem.stat({
    directory: Directory.Documents,
    path,
  });
  return mapFileInfo(stat, path);
};

export const mobileFs: FileSystem = {
  fileInfo,
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
