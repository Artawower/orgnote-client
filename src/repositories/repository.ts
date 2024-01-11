import { DbMigrations } from './migrator';
import Dexie from 'dexie';

export class BaseRepository {
  public static readonly migrations: DbMigrations;
  public static readonly storeName: string;

  protected readonly dbName = 'orgnote';

  constructor(protected readonly db: Dexie) {}

  get store(): Dexie.Table {
    throw new Error('Store getter not implemented.');
  }
}
