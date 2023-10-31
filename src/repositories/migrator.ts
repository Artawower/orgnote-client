export interface DbMigrations<TModel = unknown> {
  [version: string]: {
    indexes: string;
    migrate?: (db: TModel) => void;
  };
}

// TODO: master enhance mechanism for simple update one field, not all indexes
export function migrator<TModel = unknown>() {
  const migrations: DbMigrations<TModel> = {};

  let lastVersion: number;
  const initMigration = () => {
    if (!migrations[lastVersion]) {
      migrations[lastVersion] = { indexes: '' };
    }
  };

  const v = (version: number) => {
    lastVersion = version;
    initMigration();
    return {
      indexes,
      build,
    };
  };

  const upgrade = (cb: (arg0: TModel) => void) => {
    initMigration();
    migrations[lastVersion].migrate = cb;
    return {
      v,
      build,
    };
  };

  const indexes = (indexes: string) => {
    migrations[lastVersion].indexes = indexes;
    return {
      v,
      build,
      upgrade,
    };
  };

  const build = () => {
    return migrations;
  };

  return {
    v,
  };
}
