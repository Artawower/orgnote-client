import { boot } from 'quasar/wrappers';
import { Database, NoteRepository } from '../repositories';

const db = new Database(NoteRepository);

const repositories = {
  notes: new NoteRepository(db),
} as const;

export default boot(({ app }) => {
  app.config.globalProperties.$db = db;
  app.config.globalProperties.$repositories = repositories;
});

export { db, repositories };
