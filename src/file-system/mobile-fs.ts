import {
  Filesystem,
  Encoding,
  FileInfo as CapacitorFileInfo,
} from '@capacitor/filesystem';
import { FileInfo, FileSystem } from './file-system.model';

const readFile: FileSystem['readFile'] = async (path: string) => {
  const data = (
    await Filesystem.readFile({
      path,
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
    data: content,
    encoding: encoding as unknown as Encoding,
  });
};

const rename: FileSystem['rename'] = async (
  oldPath: string,
  newPath: string
) => {
  await Filesystem.rename({ from: oldPath, to: newPath });
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
    path,
  });
};

const mkdir: FileSystem['mkdir'] = async (path: string) => {
  await Filesystem.mkdir({
    path,
  });
};

export const mobileFs: FileSystem = {
  readFile,
  writeFile,
  rename,
  deleteFile,
  readDir,
  rmdir,
  mkdir,
};
