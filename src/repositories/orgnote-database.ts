import { Database } from './database';
import { ExtensionRepository } from './extension-repository';
import { FileManagerRepository } from './file-manager-repository';
import { FileRepository } from './file-repository';
import { NoteRepository } from './note-repository';
import { initInMemoryOrgNoteRepositories } from './in-memory-orgnote-database';
import { DataAccessLayer } from './data-access-layer.model';

function initClientOrgNoteRepositories(): DataAccessLayer {
  const db = new Database(
    NoteRepository,
    FileRepository,
    FileManagerRepository,
    ExtensionRepository
  );

  const repositories = {
    notes: new NoteRepository(db),
    files: new FileRepository(db),
    fileManager: new FileManagerRepository(db),
    extensions: new ExtensionRepository(db),
  };

  return { db, repositories };
}

export function initOrgNoteRepositories(): DataAccessLayer {
  if (process.env.CLIENT) {
    return initClientOrgNoteRepositories();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const databaseMock = {
    dropAll: async () => {},
  } as unknown as DataAccessLayer['db'];

  return {
    db: databaseMock,
    repositories: initInMemoryOrgNoteRepositories(),
  };
}
