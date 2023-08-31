import Dexie from 'dexie';
import { BaseRepository } from './repository';

export class Database<T extends typeof BaseRepository[]> extends Dexie {
  private readonly currentVersion = 12;
  constructor(...repositories: T) {
    super('second-brain');
    this.initSchema(repositories);
    this.open();
    // TODO: master apply migrations here
  }

  private initSchema(repositories: T): void {
    const storesSchema = this.getCombinedStoresSchema(repositories);
    this.version(this.currentVersion).stores(storesSchema);
  }

  private getCombinedStoresSchema(repositories: typeof BaseRepository[]): {
    [key: string]: string;
  } {
    const combinedStoresSchema = repositories.reduce<{ [key: string]: string }>(
      (acc, repo: T[number]) => {
        acc[repo.storeName] = repo.indexes;
        return acc;
      },
      {}
    );

    return combinedStoresSchema;
  }
}
