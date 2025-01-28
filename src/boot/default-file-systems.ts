import { defineBoot } from '@quasar/app-vite/wrappers';
import { I18N } from 'orgnote-api';
import { SIMPLE_FS_NAME, useSimpleFs } from 'src/infrastructure/file-systems/simple-fs';
import { useFileSystemManagerStore } from 'src/stores/file-system-manager';

export default defineBoot(async ({ store }) => {
  const fsManager = useFileSystemManagerStore(store);
  fsManager.register({
    name: SIMPLE_FS_NAME,
    fs: useSimpleFs,
    description: I18N.SIMPLE_FS_DESCRIPTION,
  });
});
