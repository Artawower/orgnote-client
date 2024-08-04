// TODO: https://github.com/zagham-nadeem/capacitor-folder-picker/issues/1
declare module 'capacitor-folder-picker' {
  export interface FolderPickerPlugin {
    chooseFolder(): Promise<{
      path: string;
    }>;
  }

  declare const FolderPicker: FolderPickerPlugin;
}
