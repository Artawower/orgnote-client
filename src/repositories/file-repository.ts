import { BaseRepository } from './repository';
import { migrator } from './migrator';
import Dexie from 'dexie';
import { FileCache, FileRepository as IFileRepository } from 'orgnote-api';
import Fuse, { IFuseOptions } from 'fuse.js';

const fuseOptions: IFuseOptions<FileCache> = {
  threshold: 0.4,
  keys: ['fileName', 'filePath'],
};

export class FileRepository extends BaseRepository implements IFileRepository {
  public static storeName = 'files';

  public static readonly migrations = migrator()
    .v(1)
    .indexes('++id,name')
    .v(3)
    .indexes(
      '++filePath,fileName,fileExtension,updatedAt,createdAt,touchedAt,size,deletedAt,uploaded'
    )
    .build();

  get store(): Dexie.Table<FileCache, string> {
    return this.db.table<FileCache, string>(FileRepository.storeName);
  }

  async upsert(file: FileCache): Promise<void> {
    const existingFileCache = this.getByPath(file.filePath);
    if (!existingFileCache) {
      file.createdAt = new Date();
    }
    this.store.put(file);
  }

  async bulkUpsert(file: FileCache[]): Promise<void> {
    this.store.bulkPut(file);
  }

  async update(filePath: string, file: Partial<FileCache>): Promise<void> {
    this.store.update(filePath, file);
  }

  async delete(filePath: string): Promise<void> {
    this.store.delete(filePath);
  }

  async markAsDelete(filePath: string, deletedAt?: Date): Promise<void> {
    deletedAt ??= new Date();
    this.store.update(filePath, { deletedAt });
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getFirstUnuploaded(): Promise<FileCache | undefined> {
    return this.store.filter((f) => !f.uploaded && !f.deletedAt).first();
  }

  async search(query: string): Promise<FileCache[]> {
    return this.store
      .filter((f) => {
        const fuse = new Fuse([f], fuseOptions);
        const res = fuse.search(query);
        return !!res.length;
      })
      .toArray();
  }

  async getAll(): Promise<FileCache[]> {
    return this.store.toArray();
  }

  async getFilesAfterUpdateTime(updatedTime?: Date): Promise<FileCache[]> {
    updatedTime ??= new Date();
    return this.store.filter((f) => f.updatedAt > updatedTime).toArray();
  }

  async count(): Promise<number> {
    return this.store.count();
  }

  async getByPath(path: string): Promise<FileCache> {
    return this.store.get({
      filePath: path,
    });
  }
}
