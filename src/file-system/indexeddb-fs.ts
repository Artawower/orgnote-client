// import {
//   ErrorFileNotFound,
//   FileInfo,
//   FileSystem,
//   getFileName,
// } from 'orgnote-api';

// import fs, { IDirectoryEntry, IFileEntry } from 'indexeddb-fs';

// type DirInfo = Awaited<ReturnType<(typeof fs)['readDirectory']>>;

// export const useIndexedDBFs = (): FileSystem => {
//   const rootNoteFodler = 'org-notes';
//   const normalizePath = (path: string): string => `${rootNoteFodler}${path}`;

//   const throwMapedError = (err: unknown): Error => {
//     // TODO: handling here
//     throw err;
//   };

//   const isNoFileError = (e: Error | unknown): boolean => false;

//   const withErrorHandling = <A extends unknown[], R>(
//     fn: (...args: A) => R
//   ): ((...args: A) => Promise<Awaited<R>>) => {
//     return async (...args: A): Promise<Awaited<R>> => {
//       try {
//         return await fn(...args);
//       } catch (e) {
//         throwMapedError(e);
//       }
//     };
//   };

//   const readFile: FileSystem['readFile'] = async <
//     T extends 'utf8' | 'binary' = 'utf8',
//     R = T extends 'utf8' ? string : Uint8Array,
//   >(
//     path: string
//   ): Promise<R> => {
//     path = normalizePath(path);
//     return await fs.readFile(path);
//   };

//   const writeFile: FileSystem['writeFile'] = async (
//     path: string,
//     content: string | Uint8Array,
//     _encoding: string
//   ) => {
//     path = normalizePath(path);

//     await fs.writeFile(path, content);
//   };

//   const rename: FileSystem['rename'] = async (
//     oldPath: string,
//     newPath: string
//   ) => {
//     oldPath = normalizePath(oldPath);
//     newPath = normalizePath(newPath);
//     await fs.renameFile(oldPath, newPath);
//   };

//   const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
//     path = normalizePath(path);

//     return await fs.removeFile(path);
//   };

//   const readDir: FileSystem['readDir'] = async (path: string) => {
//     path = normalizePath(path);
//     const info = await fs.readDirectory(path);
//     const files = mapFileInfos(info);
//     console.log('✎: [line 72][indexeddb-fs.ts] files: ', files);
//     return files;
//   };

//   const mapFileInfos = (info: DirInfo): FileInfo[] => {
//     const dirs: FileInfo[] = info.directories.map(mapFileInfo);
//     const files: FileInfo[] = info.files.map(mapFileInfo);

//     const fileList = [...dirs, ...files];
//     return fileList;
//   };

//   const mapFileInfo = (
//     info: Omit<IFileEntry, 'data'> | IDirectoryEntry
//   ): FileInfo => {
//     const fileInfo: FileInfo = {
//       name: info.name,
//       path: info.fullPath.replace(`root/${rootNoteFodler}/`, ''),
//       type: info.type,
//       size: 0,
//       ctime: info.createdAt,
//       mtime: null,
//       atime: null,
//     };
//     console.log('✎: [line 98][indexeddb-fs.ts] fileInfo: ', fileInfo);
//     return fileInfo;
//   };

//   const rmdir: FileSystem['rmdir'] = async (path: string) => {
//     path = normalizePath(path);

//     await fs.remove(path);
//   };

//   const mkdir: FileSystem['mkdir'] = async (path: string) => {
//     path = normalizePath(path);
//     await fs.createDirectory(path);
//   };

//   const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
//     path = normalizePath(path);

//     try {
//       return await fs.exists(path);
//     } catch (e) {
//       if (isNoFileError(e)) {
//         return false;
//       }
//       throw e;
//     }
//   };

//   const isFileExist: FileSystem['isFileExist'] = async (path: string) => {
//     path = normalizePath(path);

//     try {
//       return await fs.exists(path);
//     } catch (e) {
//       if (isNoFileError(e)) {
//         return false;
//       }
//       throw e;
//     }
//   };

//   const utimeSync: FileSystem['utimeSync'] = async (
//     path: string,
//     atime?: string | number | Date,
//     mtime?: string | number | Date
//   ) => {
//     path = normalizePath(path);

//     // TODO: master implement update utime through cache
//   };

//   const fileInfo: FileSystem['fileInfo'] = async (path: string) => {
//     path = normalizePath(path);
//     const stats = await fs.fileDetails(path);
//     return mapFileInfo(stats);
//   };

//   const rf = withErrorHandling(readFile);

//   const init = async () => {
//     const isRootNoteFolderExist = await isDirExist(rootNoteFodler);
//     if (isRootNoteFolderExist) {
//       return;
//     }
//     await fs.createDirectory(rootNoteFodler);
//   };

//   return {
//     readFile: rf,
//     fileInfo: withErrorHandling(fileInfo),
//     writeFile: withErrorHandling(writeFile),
//     rename: withErrorHandling(rename),
//     deleteFile: withErrorHandling(deleteFile),
//     readDir: withErrorHandling(readDir),
//     rmdir: withErrorHandling(rmdir),
//     mkdir: withErrorHandling(mkdir),
//     isDirExist: isDirExist,
//     isFileExist: isFileExist,
//     utimeSync: withErrorHandling(utimeSync),
//     init,
//   };
// };
