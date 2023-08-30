import Dexie from 'dexie';

export class BaseRepository {
  public static readonly indexes: string;
  public static readonly storeName: string;

  protected readonly dbName = 'second-brain';

  constructor(protected readonly db: Dexie) {}

  get store(): Dexie.Table {
    throw new Error('Store getter not implemented.');
  }
}
