import { Repositories } from 'src/models';
import { Database } from './database';
import { ExtensionRepository } from './extension-repository';
import { FileManagerRepository } from './file-manager-repository';
import { FileRepository } from './file-repository';
import { NoteRepository } from './note-repository';

export const db = new Database(
  NoteRepository,
  FileRepository,
  FileManagerRepository,
  ExtensionRepository
);

export const repositories: Repositories = {
  notes: new NoteRepository(db),
  files: new FileRepository(db),
  fileManager: new FileManagerRepository(db),
  extensions: new ExtensionRepository(db),
};
