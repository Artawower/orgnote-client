import { boot } from 'quasar/wrappers';
import {
  Database,
  NoteRepository,
  FileRepository,
  FileManagerRepository,
} from '../repositories';

const db = new Database(NoteRepository, FileRepository, FileManagerRepository);

const repositories = {
  notes: new NoteRepository(db),
  files: new FileRepository(db),
  fileManager: new FileManagerRepository(db),
} as const;

export default boot(({ app }) => {
  app.config.globalProperties.$db = db;
  app.config.globalProperties.$repositories = repositories;
});

export { db, repositories };
