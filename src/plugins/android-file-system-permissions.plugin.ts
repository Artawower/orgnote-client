import { registerPlugin } from '@capacitor/core';

export interface FileSysstemPermissionPlugin {
  requestAccess(): Promise<{ value: boolean }>;
  hasAccess(): Promise<{ value: boolean }>;
}

export const AndroidFileSystemPermission =
  registerPlugin<FileSysstemPermissionPlugin>('FileSystemPermission');
