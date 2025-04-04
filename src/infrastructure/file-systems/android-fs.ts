import type { DiskFile, FileSystem, InitFileSystemParams } from 'orgnote-api';
import { AndroidSaf } from 'src/plugins/saf.plugin';

export const ANDROID_SAF_FS_NAME = 'SAF android file system';

export const useAndroidFs = (): FileSystem => {
  let rootUri = '';

  const init: FileSystem['init'] = async (
    params: InitFileSystemParams,
  ): Promise<InitFileSystemParams> => {
    params.root = params?.root ?? (await pickFolder());
    rootUri = params.root;
    return params;
  };

  const pickFolder = async (): Promise<string> => {
    const res = await AndroidSaf.openDirectoryPicker();
    return res.uri;
  };

  const resolveUri = (path: string): string => `${rootUri}/${path}`;

  const toDiskFile = (file: {
    name: string;
    uri?: string;
    path?: string;
    type: 'file' | 'directory';
    size: number;
    mtime: number;
  }): DiskFile => ({
    name: file.name,
    path: file.uri || file.path || '',
    uri: file.uri || file.path,
    type: file.type,
    size: file.size,
    mtime: file.mtime,
  });

  const readFile: FileSystem['readFile'] = async (path, encoding = 'utf8') => {
    try {
      const res = await AndroidSaf.readFile({ uri: resolveUri(path) });
      console.log('✎: [line 36][ANDROID FS] res: ', res);
      return (encoding === 'utf8' ? res.data : new TextEncoder().encode(res.data)) as never;
    } catch (e) {
      console.log('✎: [line 38][ANDROID FS] e: ', e);
    }
  };

  const writeFile: FileSystem['writeFile'] = async (path, content) => {
    const data = typeof content === 'string' ? content : new TextDecoder().decode(content);
    const dirPath = path.substring(0, path.lastIndexOf('/'));
    const fileName = path.split('/').pop() || path;
    await AndroidSaf.writeFile({ uri: resolveUri(dirPath), fileName, data });
  };

  const readDir: FileSystem['readDir'] = async (path) => {
    const { files } = await AndroidSaf.readDir({ uri: resolveUri(path) });
    console.log('✎: [line 48][ANDROID FS] files: ', files);
    return files.map(toDiskFile);
  };

  const fileInfo: FileSystem['fileInfo'] = async (path) => {
    const file = await AndroidSaf.fileInfo({ uri: resolveUri(path) });
    return toDiskFile(file);
  };

  const mkdir: FileSystem['mkdir'] = async (path) => {
    console.log('✎: [line 66][ANDROID FS] path: ', path);
    await AndroidSaf.mkdir({ path: resolveUri(path) });
  };

  const deleteFile: FileSystem['deleteFile'] = async (path) => {
    await AndroidSaf.delete({ uri: resolveUri(path) });
  };

  const rename: FileSystem['rename'] = async (path, newPath) => {
    const newName = newPath.split('/').pop() || newPath;
    await AndroidSaf.rename({ uri: resolveUri(path), newName });
  };

  const isDirExist: FileSystem['isDirExist'] = async (path) => {
    try {
      const info = await fileInfo(path);
      return info.type === 'directory';
    } catch {
      return false;
    }
  };

  const isFileExist: FileSystem['isFileExist'] = async (path) => {
    try {
      const info = await fileInfo(path);
      return info.type === 'file';
    } catch {
      return false;
    }
  };

  const utimeSync: FileSystem['utimeSync'] = async (path, _, mtime) => {
    const timestamp = mtime ? new Date(mtime).getTime() : Date.now();
    await AndroidSaf.utime({ uri: resolveUri(path), mtime: timestamp });
  };

  const rmdir: FileSystem['rmdir'] = async (path) => {
    const dirFiles = await readDir(path);
    await Promise.all(
      dirFiles.map((file) =>
        file.type === 'directory' ? rmdir(file.path) : deleteFile(file.path),
      ),
    );
    await deleteFile(path);
  };

  return {
    init,
    readFile,
    writeFile,
    readDir,
    fileInfo,
    rename,
    deleteFile,
    mkdir,
    rmdir,
    isDirExist,
    isFileExist,
    utimeSync,
    pickFolder,
  };
};
