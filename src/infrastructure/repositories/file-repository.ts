import type Dexie from 'dexie';
import type { FileInfo, FileInfoRepository } from 'orgnote-api';
import type { IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';
import { migrator } from './migrator';

const fuseOptions: IFuseOptions<FileInfo> = {
  threshold: 0.4,
  keys: ['fileName', 'filePath'],
};

export const FILE_REPOSITORY_NAME = 'files';
export const FILE_MIGRATIONS = migrator<FileInfo>()
  .v(1)
  .indexes('++id,name')
  .v(3)
  .indexes(
    '++filePath,fileName,fileExtension,updatedAt,createdAt,touchedAt,size,deletedAt,uploaded',
  )
  .build();

export const createFileRepository = (db: Dexie): FileInfoRepository => {
  const storeName = 'files';
  const store = db.table<FileInfo, string>(storeName);

  const upsert = async (file: FileInfo): Promise<void> => {
    const existingFileInfo = await getByPath(file.filePath);
    if (!existingFileInfo) {
      file.createdAt = new Date();
    }
    await store.put(file);
  };

  const bulkUpsert = async (files: FileInfo[]): Promise<void> => {
    await store.bulkPut(files);
  };

  const update = async (filePath: string, file: Partial<FileInfo>): Promise<void> => {
    await store.update(filePath, file);
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    await store.delete(filePath);
  };

  const markAsDelete = async (filePath: string, deletedAt: Date = new Date()): Promise<void> => {
    await store.update(filePath, { deletedAt });
  };

  const clear = async (): Promise<void> => {
    await store.clear();
  };

  const search = async (query: string): Promise<FileInfo[]> => {
    const allFiles = await store.toArray();
    const fuse = new Fuse(allFiles, fuseOptions);
    return fuse.search(query).map((result) => result.item);
  };

  const getAll = async (): Promise<FileInfo[]> => {
    return store.toArray();
  };

  const getFilesAfterUpdateTime = async (updatedTime: Date = new Date()): Promise<FileInfo[]> => {
    return store.filter((f) => f.updatedAt! > updatedTime).toArray();
  };

  const count = async (): Promise<number> => {
    return store.count();
  };

  const getByPath = async (path: string): Promise<FileInfo | undefined> => {
    const note = await store.get({ filePath: path });
    if (note?.deletedAt) {
      return;
    }
    return note;
  };

  return {
    upsert,
    bulkUpsert,
    update,
    delete: deleteFile,
    markAsDelete,
    search,
    getAll,
    getFilesAfterUpdateTime,
    count,
    getByPath,
    clear,
  };
};
