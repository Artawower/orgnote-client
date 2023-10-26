import { boot } from 'quasar/wrappers';
import { db, repositories } from 'src/repositories';

export default boot(({ app }) => {
  app.config.globalProperties.$db = db;
  app.config.globalProperties.$repositories = repositories;
});

export { db, repositories };
