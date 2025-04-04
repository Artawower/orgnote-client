import { registerPlugin } from '@capacitor/core';

export interface SafPlugin {
  openDirectoryPicker(): Promise<{ uri: string }>;
  readFile(options: { uri: string }): Promise<{ data: string }>;
  writeFile(options: { uri: string; fileName: string; data: string }): Promise<void>;
  delete(options: { uri: string }): Promise<void>;
  rename(options: { uri: string; newName: string }): Promise<void>;
  fileInfo(options: {
    uri: string;
  }): Promise<{ name: string; type: 'file' | 'directory'; size: number; mtime: number }>;
  readDir(options: { uri: string }): Promise<{
    files: Array<{
      name: string;
      uri: string;
      type: 'file' | 'directory';
      size: number;
      mtime: number;
    }>;
  }>;
  utime(options: { uri: string; mtime: number }): Promise<void>;
  mkdir(options: { path: string }): Promise<{ uri: string }>;
}

export const AndroidSaf = registerPlugin<SafPlugin>('SafPlugin');
