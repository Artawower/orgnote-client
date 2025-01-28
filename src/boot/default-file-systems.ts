import { defineBoot } from '@quasar/app-vite/wrappers';
import { TXT_SIMPLE_FS_DESCRIPTION } from 'orgnote-api';
import { SIMPLE_FS_NAME, useSimpleFs } from 'src/infrastructure/file-systems/simple-fs';
import { useFileSystemManagerStore } from 'src/stores/file-system-manager';

export default defineBoot(async ({ store }) => {
  const fsManager = useFileSystemManagerStore(store);
  fsManager.register({
    name: SIMPLE_FS_NAME,
    fs: useSimpleFs,
    description: TXT_SIMPLE_FS_DESCRIPTION,
  });
});
