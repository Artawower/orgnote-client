export interface FileTree {
  name: string;
  id?: string;
  filePath: string[];
  type: 'file' | 'directory';
  meta?: {
    color?: string;
    icon?: string;
    [key: string]: unknown;
  };

  children?: FileTree[];
}
