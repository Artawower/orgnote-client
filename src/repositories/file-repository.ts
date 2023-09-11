import Dexie from 'dexie';
import { BaseRepository } from './repository';

export class FileRepository extends BaseRepository {
  public static storeName = 'files';

  public static readonly indexes = '++id, name';

  get store(): Dexie.Table<File, string> {
    return this.db.table(FileRepository.storeName);
  }

  async save(file: File): Promise<void> {
    await this.store.put(file);
  }

  async deleteByName(name: string): Promise<void> {
    await this.store.where('name').equals(name).delete();
  }

  async getByName(name: string): Promise<File> {
    return this.store.get({ name });
  }

  async getFirst(): Promise<File> {
    return this.store.toCollection().first();
  }
}
