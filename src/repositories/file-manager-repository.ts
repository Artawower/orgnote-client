import Dexie from 'dexie';
import { BaseRepository } from './repository';

export interface FileNodeInfo {
  name: string;
  id?: string;
  filePath: string[];
  type: 'file' | 'folder';
  meta?: {
    color?: string;
    icon?: string;
    [key: string]: unknown;
  };
}

export interface FileNode extends FileNodeInfo {
  children?: FileTree;
}

export interface FileTree {
  [key: string]: FileNode;
}

export class FileManagerRepository extends BaseRepository {
  public static storeName = 'file-manager';

  public static readonly indexes = '&key';

  get store(): Dexie.Table<{ key: string; fileTree: FileTree }, string> {
    return this.db.table(
      FileManagerRepository.storeName
    ) as unknown as Dexie.Table<{ key: string; fileTree: FileTree }, string>;
  }

  async getAll(): Promise<FileTree> {
    return (await this.store.toCollection().first())?.fileTree;
  }

  async upsert(fileTree: FileTree): Promise<void> {
    await this.store.put({
      key: FileManagerRepository.storeName,
      fileTree,
    });
  }
}
