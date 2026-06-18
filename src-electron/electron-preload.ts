import type { IpcRendererEvent } from 'electron';
import type { DiskFile, FileSystemChange } from 'orgnote-api';
import { contextBridge, ipcRenderer } from 'electron';
import { ELECTRON_FS_CHANNELS } from './electron-fs-channels';

interface ElectronFsWatchEvent {
  watchId: number;
  change: FileSystemChange;
}

contextBridge.exposeInMainWorld('electron', {
  setHeaderColor: (color: string) => ipcRenderer.invoke('setHeaderColor', color),
  auth: (url: string): Promise<{ redirectUrl: string; error?: string }> => {
    return ipcRenderer.invoke('oauth-login', url);
  },
  onNavigate: (callback: (route: string) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, route: string) => callback(route);
    ipcRenderer.on('navigate', handler);
    return () => ipcRenderer.removeListener('navigate', handler);
  },
  fs: {
    selectDirectory: (): Promise<string | undefined> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.selectDirectory),
    mountRoot: (root: string): Promise<boolean> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.mountRoot, root),
    readFile: (path: string, encoding?: 'utf8' | 'binary'): Promise<string | Uint8Array> =>
      ipcRenderer.invoke(ELECTRON_FS_CHANNELS.readFile, path, encoding),
    writeFile: (
      path: string,
      content: string | Uint8Array,
      encoding?: BufferEncoding,
    ): Promise<void> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.writeFile, path, content, encoding),
    readDir: (path: string): Promise<DiskFile[]> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.readDir, path),
    fileInfo: (path: string): Promise<DiskFile | undefined> =>
      ipcRenderer.invoke(ELECTRON_FS_CHANNELS.fileInfo, path),
    rename: (path: string, nextPath: string): Promise<void> =>
      ipcRenderer.invoke(ELECTRON_FS_CHANNELS.rename, path, nextPath),
    deleteFile: (path: string): Promise<void> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.deleteFile, path),
    rmdir: (path: string): Promise<void> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.rmdir, path),
    mkdir: (path: string): Promise<void> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.mkdir, path),
    utime: (
      path: string,
      atime?: string | number | Date,
      mtime?: string | number | Date,
    ): Promise<void> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.utime, path, atime, mtime),
    copyFile: (src: string, dest: string): Promise<void> =>
      ipcRenderer.invoke(ELECTRON_FS_CHANNELS.copyFile, src, dest),
    watchStart: (): Promise<number> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.watchStart),
    watchStop: (watchId: number): Promise<void> => ipcRenderer.invoke(ELECTRON_FS_CHANNELS.watchStop, watchId),
    onWatchEvent: (callback: (event: ElectronFsWatchEvent) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, payload: ElectronFsWatchEvent) => callback(payload);
      ipcRenderer.on(ELECTRON_FS_CHANNELS.watchEvent, handler);
      return () => ipcRenderer.removeListener(ELECTRON_FS_CHANNELS.watchEvent, handler);
    },
  },
});
