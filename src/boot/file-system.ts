import { boot } from 'quasar/wrappers';
import { configureFileSystem } from 'src/hooks/file-system';

export default boot(async () => {
  await configureFileSystem();
});
