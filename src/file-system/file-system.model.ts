export interface FileInfo {
  name: string;
  type: 'directory' | 'file';
  size: number;
  atime?: number;
  ctime?: number;
  mtime: number;
  uri?: string;
}

// TODO: to orgnote api
export interface FileSystem {
  readFile: (path: string) => Promise<string>;
  writeFile: (
    path: string,
    content: string,
    encoding?: BufferEncoding
  ) => Promise<void>;
  readDir: (path: string) => Promise<FileInfo[]>;
  rename: (path: string, newPath: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  rmdir: (path: string) => Promise<void>;
  mkdir: (path: string) => Promise<void>;
  isDirExist: (path: string) => Promise<boolean>;
  isFileExist: (path: string) => Promise<boolean>;
}
