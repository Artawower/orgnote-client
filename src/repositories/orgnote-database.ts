import { Database } from './database';
import { FileManagerRepository } from './file-manager-repository';
import { FileRepository } from './file-repository';
import { NoteRepository } from './note-repository';

export const db = new Database(
  NoteRepository,
  FileRepository,
  FileManagerRepository
);

export const repositories = {
  notes: new NoteRepository(db),
  files: new FileRepository(db),
  fileManager: new FileManagerRepository(db),
} as const;
