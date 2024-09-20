// TODO: feat/native-file-sync delete. Use orgnote api

// export interface FileInfo {
//   name: string;
//   path: string;
//   type: 'directory' | 'file';
//   size: number;
//   atime?: number;
//   ctime?: number;
//   mtime: number;
//   uri?: string;
// }

// export interface FileSystem {
//   readFile: <T extends 'utf8'>(
//     path: string,
//     encoding: T
//   ) => Promise<T extends 'utf8' ? string : Uint8Array>;
//   writeFile: (
//     path: string,
//     content: string | Uint8Array,
//     encoding?: BufferEncoding
//   ) => Promise<void>;
//   readDir: (path: string) => Promise<FileInfo[]>;
//   fileInfo: (path: string) => Promise<FileInfo>;
//   rename: (path: string, newPath: string) => Promise<void>;
//   deleteFile: (path: string) => Promise<void>;
//   rmdir: (path: string) => Promise<void>;
//   mkdir: (path: string) => Promise<void>;
//   isDirExist: (path: string) => Promise<boolean>;
//   isFileExist: (path: string) => Promise<boolean>;
// }
