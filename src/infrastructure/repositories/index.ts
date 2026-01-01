import type { Repositories } from 'orgnote-api';
import { createDatabase } from './create-database';
import { NOTE_REPOSITORY_NAME, NOTE_MIGRATIONS } from './note-info-repository';
import { createNoteInfoRepository } from './note-info-repository';
import {
  createLoggerRepository,
  LOGGER_MIGRATIONS,
  LOGGER_REPOSITORY_NAME,
} from './logger-repository';
import {
  createLayoutSnapshotRepository,
  PANE_SNAPSHOT_MIGRATIONS,
  PANE_SNAPSHOT_REPOSITORY_NAME,
} from './layout-snapshot-repository';
import type Dexie from 'dexie';
import { createQueueRepository, QUEUE_MIGRATIONS, QUEUE_REPOSITORY_NAME } from './queue-repository';
import {
  createExtensionSourceRepository,
  EXTENSION_SOURCE_MIGRATIONS,
  EXTENSION_SOURCE_REPOSITORY_NAME,
} from './extension-source-repository';

let database: Dexie | undefined;

export const getDatabase = (): Dexie | undefined => database;

export async function initRepositories(): Promise<Repositories> {
  const { db } = createDatabase([
    { storeName: NOTE_REPOSITORY_NAME, migrations: NOTE_MIGRATIONS },
    { storeName: LOGGER_REPOSITORY_NAME, migrations: LOGGER_MIGRATIONS },
    { storeName: PANE_SNAPSHOT_REPOSITORY_NAME, migrations: PANE_SNAPSHOT_MIGRATIONS },
    { storeName: QUEUE_REPOSITORY_NAME, migrations: QUEUE_MIGRATIONS },
    { storeName: EXTENSION_SOURCE_REPOSITORY_NAME, migrations: EXTENSION_SOURCE_MIGRATIONS },
  ]);
  database = db;
  return {
    noteInfoRepository: createNoteInfoRepository(db),
    logRepository: createLoggerRepository(db),
    layoutSnapshotRepository: createLayoutSnapshotRepository(db),
    queueRepository: createQueueRepository(db),
    extensionSourceRepository: createExtensionSourceRepository(db),
  };
}
