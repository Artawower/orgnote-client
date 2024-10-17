import { registerPlugin } from '@capacitor/core';

export interface FileSystemPermissionPlugin {
  requestAccess(): Promise<{ hasAccess: boolean }>;
  hasAccess(): Promise<{ hasAccess: boolean }>;
  openAccess(): Promise<{ hasAccess: boolean }>;
}

export const AndroidFileSystemPermission =
  registerPlugin<FileSystemPermissionPlugin>('FileSystemPermission');
