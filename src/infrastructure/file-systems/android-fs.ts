import { splitPath, type DiskFile, type FileSystem, type FileSystemParams } from 'orgnote-api';
import { AndroidSaf } from 'src/plugins/saf.plugin';

export const ANDROID_SAF_FS_NAME = 'SAF android file system';

export const useAndroidFs = (): FileSystem => {
  let rootUri = '';

  const init: FileSystem['init'] = async (params: FileSystemParams): Promise<FileSystemParams> => {
    params.root = params?.root ?? (await pickFolder());
    rootUri = params.root;
    return params;
  };

  const mount: FileSystem['mount'] = async (params: FileSystemParams): Promise<boolean> => {
    if (params.root) {
      rootUri = params.root;
      return true;
    }
    return false;
  };

  const pickFolder = async (): Promise<string> => {
    const res = await AndroidSaf.openDirectoryPicker();
    return res.uri;
  };

  const toDiskFile = (file?: {
    name: string;
    uri?: string;
    path?: string;
    type: 'file' | 'directory';
    size: number;
    mtime: number;
  }): DiskFile => {
    if (!file) {
      return;
    }
    const uri = file.uri || file.path || '';
    let relativePath = '';

    const rootId = rootUri.split('/tree/')[1];
    const docPrefix = `/document/${rootId}`;
    const index = uri.indexOf(docPrefix);

    if (index !== -1) {
      const encodedRelPath = uri.slice(index + docPrefix.length);
      relativePath = decodeURIComponent(encodedRelPath).replace(/^\/+/, '');
    }

    return {
      name: file.name,
      path: `/${relativePath}`,
      uri,
      type: file.type,
      size: file.size,
      mtime: file.mtime,
    };
  };

  const readFile: FileSystem['readFile'] = async (path, encoding = 'utf8') => {
    try {
      const res = await AndroidSaf.readFile({ uri: rootUri, path: splitPath(path) });
      return (encoding === 'utf8' ? res.data : new TextEncoder().encode(res.data)) as never;
    } catch (e) {
      console.log('✎: [line 38][ANDROID FS] e: ', e);
    }
  };

  const writeFile: FileSystem['writeFile'] = async (path, content) => {
    const data = typeof content === 'string' ? content : new TextDecoder().decode(content);
    await AndroidSaf.writeFile({ uri: rootUri, path: splitPath(path), data });
  };

  const readDir: FileSystem['readDir'] = async (path) => {
    const { files } = await AndroidSaf.readDir({ uri: rootUri, path: splitPath(path) });
    const normalizedFiles = files.map(toDiskFile);
    return normalizedFiles;
  };

  const fileInfo: FileSystem['fileInfo'] = async (path) => {
    const file = await AndroidSaf.fileInfo({ uri: rootUri, path: splitPath(path) });
    return toDiskFile(file);
  };

  const mkdir: FileSystem['mkdir'] = async (path) => {
    await AndroidSaf.mkdir({ uri: rootUri, path: splitPath(path) });
  };

  const deleteFile: FileSystem['deleteFile'] = async (path) => {
    await AndroidSaf.delete({ uri: rootUri, path: splitPath(path) });
  };

  const rename: FileSystem['rename'] = async (path, newPath) => {
    await AndroidSaf.rename({
      uri: rootUri,
      newPath: splitPath(newPath),
      oldPath: splitPath(path),
    });
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
    await AndroidSaf.utime({ uri: rootUri, path: splitPath(path), mtime: timestamp });
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
    mount,
  };
};
