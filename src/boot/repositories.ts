import { boot } from 'quasar/wrappers';
import { initOrgNoteRepositories } from 'src/repositories';

const { repositories, db } = initOrgNoteRepositories();

export default boot(({ app }) => {
  app.config.globalProperties.$repositories = repositories;
});

export { repositories, db };
