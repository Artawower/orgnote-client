import { Repositories } from 'src/models';
import { Database } from './database';
import { ExtensionRepository } from './extension-repository';
import { FileRepository } from './file-repository';
import { NoteRepository } from './note-repository';

export interface DataAccessLayer {
  repositories: Repositories;
  db: Database<
    [typeof NoteRepository, typeof FileRepository, typeof ExtensionRepository]
  >;
}
