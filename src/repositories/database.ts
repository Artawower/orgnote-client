import { BaseRepository } from './repository';
import Dexie from 'dexie';

export class Database<T extends typeof BaseRepository[]> extends Dexie {
  private readonly currentVersion = 13;
  constructor(...repositories: T) {
    super('orgnote');
    this.initSchema(repositories);
    this.open();
    // TODO: master apply migrations here
  }

  private initSchema(repositories: T): void {
    const storesSchema = this.getCombinedStoresSchema(repositories);
    this.version(this.currentVersion).stores(storesSchema);
  }

  // TODO: IMPORTANT add migrations here!
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

  public async dropAll(): Promise<void> {
    await this.delete();
  }
}
