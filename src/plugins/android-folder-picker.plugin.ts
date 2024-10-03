import { registerPlugin } from '@capacitor/core';

export interface FolderPickerPlugin {
  pickFolder(): Promise<{ path: string }>;
}

export const AndroidFolderPicker =
  registerPlugin<FolderPickerPlugin>('FolderChooser');
