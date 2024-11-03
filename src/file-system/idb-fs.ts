// import {
//   ErrorFileNotFound,
//   FileInfo,
//   FileSystem,
//   getFileName,
// } from 'orgnote-api';
// import { mount, IDBFileSystem } from '@wwog/idbfs';

// let fs: IDBFileSystem;

// export const useIdbFs = (): FileSystem => {
//   const normalizePath = (path: string): string => `/${path}`;

//   const throwMapedError = (err: unknown): Error => {
//     throw err;
//   };

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

//   const initFs = async () => {
//     if (fs) {
//       return;
//     }
//     fs = await mount();
//   };

//   const withInitedFs = <A extends unknown[], R>(
//     fn: (...args: A) => R
//   ): ((...args: A) => Promise<Awaited<R>>) => {
//     return async (...args: A): Promise<Awaited<R>> => {
//       await initFs();
//       return await fn(...args);
//     };
//   };

//   const readFile: FileSystem['readFile'] = async <
//     T extends 'utf8' | 'binary' = 'utf8',
//     R = T extends 'utf8' ? string : Uint8Array,
//   >(
//     path: string,
//     encoding?: T
//   ): Promise<R> => {
//     path = normalizePath(path);
//     const data = await fs.readFile(path);
//     if (encoding === 'utf8') {
//       const enc = new TextDecoder('utf-8');
//       return enc.decode(data) as R;
//     }
//     return new Uint8Array(data) as R;
//   };

//   const writeFile: FileSystem['writeFile'] = async (
//     path: string,
//     content: string | Uint8Array,
//     _encoding: string
//   ) => {
//     path = normalizePath(path);

//     const data = (
//       content instanceof Uint8Array
//         ? content.buffer
//         : new TextEncoder().encode(content).buffer
//     ) as ArrayBuffer;
//     fs.writeFile(path, data, {
//       mimeType: 'file',
//     });
//   };

//   const rename: FileSystem['rename'] = async (
//     oldPath: string,
//     newPath: string
//   ) => {
//     fs.writeFileByWebFile;
//     return await fs.promises.rename(oldPath, newPath);
//   };

//   const deleteFile: FileSystem['deleteFile'] = async (path: string) => {
//     path = normalizePath(path);

//     return await fs.promises.unlink(path);
//   };

//   const readDir: FileSystem['readDir'] = async (path: string) => {
//     path = normalizePath(path);

//     const files = await fs.promises.readdir(path, { withFileTypes: true });
//     return files.map((dirent) =>
//       mapFileInfo((dirent as unknown as { stats: Stats }).stats, dirent.path)
//     );
//   };

//   const mapFileInfo = (stats: Stats, path: string): FileInfo => {
//     path = normalizePath(path);

//     return {
//       path,
//       name: getFileName(path),
//       type: stats.isFile() ? 'file' : 'directory',
//       size: stats.size,
//       atime: stats.atimeMs,
//       mtime: stats.mtimeMs,
//       ctime: stats.ctimeMs,
//     };
//   };

//   const rmdir: FileSystem['rmdir'] = async (path: string) => {
//     path = normalizePath(path);

//     return await fs.promises.rm(path, { recursive: true, force: true });
//   };

//   const mkdir: FileSystem['mkdir'] = async (path: string) => {
//     path = normalizePath(path);

//     await fs.promises.mkdir(path, { recursive: true });
//   };

//   const isDirExist: FileSystem['isDirExist'] = async (path: string) => {
//     path = normalizePath(path);

//     try {
//       return (await fs.promises.stat(path)).isDirectory();
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
//       return (await fs.promises.stat(path)).isFile();
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

//     const fi = await fileInfo(path);
//     atime ??= fi.atime;
//     mtime ??= fi.mtime;
//     await fs.promises.utimes(path, atime, mtime);
//   };

//   const fileInfo: FileSystem['fileInfo'] = async (path: string) => {
//     path = normalizePath(path);

//     const stats = await fs.promises.stat(path);

//     return mapFileInfo(stats, path);
//   };

//   const rf = withInitedFs(withErrorHandling(readFile));

//   return {
//     readFile: rf,
//     fileInfo: withInitedFs(withErrorHandling(fileInfo)),
//     writeFile: withInitedFs(withErrorHandling(writeFile)),
//     rename: withInitedFs(withErrorHandling(rename)),
//     deleteFile: withInitedFs(withErrorHandling(deleteFile)),
//     readDir: withInitedFs(withErrorHandling(readDir)),
//     rmdir: withInitedFs(withErrorHandling(rmdir)),
//     mkdir: withInitedFs(withErrorHandling(mkdir)),
//     isDirExist: withInitedFs(isDirExist),
//     isFileExist: withInitedFs(isFileExist),
//     utimeSync: withInitedFs(withErrorHandling(utimeSync)),
//   };
// };
