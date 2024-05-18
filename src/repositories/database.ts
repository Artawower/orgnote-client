import { BaseRepository } from './repository';
import Dexie from 'dexie';

interface CombinedMigrations {
  [version: string]: {
    schema: { [key: string]: string };
    migrate?: { [key: string]: (v: unknown) => void };
  };
}

export class Database<T extends (typeof BaseRepository)[]> extends Dexie {
  constructor(...repositories: T) {
    super('orgnote');
    this.initSchema(repositories);
    this.open();
    // TODO: master apply migrations here
  }

  private initSchema(repositories: T): void {
    const migrations = this.getCombinedStoresSchema(repositories);
    Object.keys(migrations).forEach((v) => {
      const m = migrations[v];

      this.version(+v)
        .stores(m.schema)
        .upgrade((tx) => {
          const tableUpdateTasks = Object.keys(m.migrate ?? {}).map(
            async (storeName) => {
              const updateFn = m.migrate?.[storeName];
              if (!updateFn) return;
              return tx.table(storeName).toCollection().modify(updateFn);
            }
          );
          return Promise.all(tableUpdateTasks);
        });
    });
  }

  private getCombinedStoresSchema(
    repositories: (typeof BaseRepository)[]
  ): CombinedMigrations {
    const combinedMigrations: CombinedMigrations = {};

    repositories.forEach((repository) => {
      Object.keys(repository.migrations).forEach((v) => {
        if (!combinedMigrations[v]) {
          combinedMigrations[v] = { schema: {}, migrate: {} };
        }

        combinedMigrations[v].schema[repository.storeName] =
          repository.migrations[v].indexes;
        combinedMigrations[v].migrate[repository.storeName] =
          repository.migrations[v].migrate;
      });
    });

    return combinedMigrations;
  }

  public async dropAll(): Promise<void> {
    await this.delete();
  }
}
