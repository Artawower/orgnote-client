import { boot } from 'quasar/wrappers';
import { configureFileSystem, useFileSystem } from 'src/hooks/file-system';

export default boot(async ({ app, store }) => {
  await configureFileSystem();
  const fs = useFileSystem();
  app.config.globalProperties.$fileSystem = fs;
  store.use(() => ({ fs }));
});
