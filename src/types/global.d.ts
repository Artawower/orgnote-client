/// <reference types="node" />

import type { DiskFile, FileSystemChange, Hotkey, OrgNoteApi } from 'orgnote-api';

export interface ElectronFsWatchEvent {
  watchId: number;
  change: FileSystemChange;
}

export interface ElectronFsAPI {
  selectDirectory: () => Promise<string | undefined>;
  mountRoot: (root: string) => Promise<boolean>;
  readFile: (path: string, encoding?: 'utf8' | 'binary') => Promise<string | Uint8Array>;
  writeFile: (
    path: string,
    content: string | Uint8Array,
    encoding?: BufferEncoding,
  ) => Promise<void>;
  readDir: (path: string) => Promise<DiskFile[]>;
  fileInfo: (path: string) => Promise<DiskFile | undefined>;
  rename: (path: string, nextPath: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  rmdir: (path: string) => Promise<void>;
  mkdir: (path: string) => Promise<void>;
  utime: (
    path: string,
    atime?: string | number | Date,
    mtime?: string | number | Date,
  ) => Promise<void>;
  copyFile: (src: string, dest: string) => Promise<void>;
  watchStart: () => Promise<number>;
  watchStop: (watchId: number) => Promise<void>;
  onWatchEvent: (callback: (event: ElectronFsWatchEvent) => void) => () => void;
}

export interface ElectronAPI {
  setHeaderColor: (color: string) => Promise<void>;
  setAppHotkeys: (hotkeys: Hotkey[]) => void;
  auth: (url: string) => Promise<{ redirectUrl: string; error?: string }>;
  onNavigate: (callback: (route: string) => void) => () => void;
  fs?: ElectronFsAPI;
}

declare global {
  interface Window {
    orgnote: OrgNoteApi;
    electron?: ElectronAPI;
  }

  interface Navigator {
    standalone: boolean;
    userAgentData?: {
      platform: string;
    };
  }

  interface HTMLInputElement {
    webkitdirectory: boolean;
    directory: boolean;
  }

  interface NamedNodeMap {
    autocomplete?: string;
  }
}
