import { boot } from 'quasar/wrappers';
import { configureFileSystem } from 'src/stores/file-system.store';

export default boot(async () => {
  await configureFileSystem();
});
