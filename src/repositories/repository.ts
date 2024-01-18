import { DbMigrations } from './migrator';
import Dexie from 'dexie';

export class BaseRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static readonly migrations: DbMigrations<any>;
  public static readonly storeName: string;

  protected readonly dbName = 'orgnote';

  constructor(protected readonly db: Dexie) {}

  get store(): Dexie.Table {
    throw new Error('Store getter not implemented.');
  }
}
