import { boot } from 'quasar/wrappers';
import { Database, NoteRepository, FileRepository } from '../repositories';

const db = new Database(NoteRepository, FileRepository);

const repositories = {
  notes: new NoteRepository(db),
  files: new FileRepository(db),
} as const;

export default boot(({ app }) => {
  app.config.globalProperties.$db = db;
  app.config.globalProperties.$repositories = repositories;
});

export { db, repositories };
