import {
  Filesystem,
  Encoding,
  FileInfo as CapacitorFileInfo,
  StatResult,
} from '@capacitor/filesystem';
import { FileInfo, FileSystem, getFileName } from 'orgnote-api';

const FILE_NOT_FOUND_ERR = 'File does not exist';
const DIRECTORY_NOT_FOUND_ERR = 'Directory does not exist';

const readFile: FileSystem['readFile'] = async <
  T extends 'utf8' | 'binary' = 'utf8',
  R = T extends 'utf8' ? string : Uint8Array,
>(
  path: string,
  encoding?: T
): Promise<R> => {
  const data = (
    await Filesystem.readFile({
      path,
      encoding: encoding as unknown as Encoding,
    })
  ).data;

  if (typeof data === 'string') {
    return data as R;
  }

  const res = await data.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  return res as R;
};

const writeFile: FileSystem['writeFile'] = async (
  path: string,
  content: string | Uint8Array,
  encoding: BufferEncoding
) => {
  const data = typeof content === 'string' ? content : new Blob([content]);
  await Filesystem.writeFile({
    path,
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
  });
};

const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
  await Filesystem.deleteFile({
    path,
  });
};

const readDir: FileSystem['readDir'] = async (path: string) => {
  const res = await Filesystem.readdir({
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
    recursive: true,
    path,
  });
};

const mkdir: FileSystem['mkdir'] = async (path: string) => {
  await Filesystem.mkdir({
    path,
  });
};

const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
  try {
    await Filesystem.readdir({
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

const utimeSync: FileSystem['utimeSync'] = async (
  _path: string,
  _atime?: string | number | Date,
  _mtime?: string | number | Date
) => {
  // Mobile file system does not have API for update ctime and atime unfortunately.
};

const fileInfo: FileSystem['fileInfo'] = async (path: string) => {
  const stat = await Filesystem.stat({
    path: path,
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
  utimeSync,
};
