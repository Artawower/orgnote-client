import { defineBoot } from '#q-app/wrappers';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { useFileSystemStore } from 'src/stores/file-system';
import { useSyncStore } from 'src/stores/sync';
import { debounce } from 'src/utils/debounce';

// TODO: dev mvoe to config
const FS_SYNC_DEBOUNCE_MS = 1200;

export const SYNC_TRIGGER_FS_ACTIONS = new Set<string>([
  'writeFile',
  'rename',
  'deleteFile',
  'mkdir',
  'rmdir',
  'copyFile',
]);

export const shouldTriggerSyncForAction = (actionName: string): boolean =>
  SYNC_TRIGGER_FS_ACTIONS.has(actionName);

export default defineBoot(({ store }) => {
  const syncStore = useSyncStore(store);
  const fileSystemStore = useFileSystemStore(store);

  const runDebouncedSync = debounce(async () => {
    const result = await to(() => syncStore.sync(), 'Failed to sync after fs action')();
    if (result.isErr()) {
      reporter.reportWarning(result.error);
    }
  }, FS_SYNC_DEBOUNCE_MS);

  fileSystemStore.$onAction(({ name, after }) => {
    if (!shouldTriggerSyncForAction(name)) {
      return;
    }

    after(runDebouncedSync);
  });
});
