import { BaseRepository } from './repository';
import Dexie from 'dexie';

// NOTE: dirty hack for safari. Without it safari doesn't create name key
interface MediaFile {
  name: string;
  file: File;
}

export class FileRepository extends BaseRepository {
  public static storeName = 'files';

  public static readonly indexes = '++id,name';

  get store(): Dexie.Table<MediaFile, string> {
    return this.db.table(FileRepository.storeName);
  }

  async save(file: File): Promise<void> {
    await this.store.put({
      file,
      name: file.name,
    });
  }

  async deleteByName(name: string): Promise<void> {
    await this.store.where('name').equals(name).delete();
  }

  async getByName(name: string): Promise<File> {
    return this.store.get({ name }).then((file) => file.file);
  }

  async getFirst(): Promise<File> {
    return this.store
      .toCollection()
      .first()
      .then((file) => file.file);
  }
}
