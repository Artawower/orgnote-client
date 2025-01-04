import type { OrgNoteApi } from 'orgnote-api';
import { createDatabase } from './create-database';
import { NOTE_REPOSITORY_NAME, NOTE_MIGRATIONS } from './note-info-repository';
import { FILE_REPOSITORY_NAME, FILE_MIGRATIONS } from './file-repository';
import { createFileRepository } from './file-repository';
import { createNoteInfoRepository } from './note-info-repository';

export async function initRepositories(): Promise<OrgNoteApi['infrastructure']> {
  const { db } = createDatabase([
    { storeName: NOTE_REPOSITORY_NAME, migrations: NOTE_MIGRATIONS },
    { storeName: FILE_REPOSITORY_NAME, migrations: FILE_MIGRATIONS },
  ]);
  return {
    fileInfoRepository: createFileRepository(db),
    noteInfoRepository: createNoteInfoRepository(db),
  };
}
