import { defineBoot } from '#q-app/wrappers';
import type { OrgNoteConfig } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { DEFAULT_CONFIG } from 'src/constants/config';
import { useAuthStore } from 'src/stores/auth';
import { useConfigStore } from 'src/stores/config';
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

type SyncGateState = {
  active?: string;
  syncType?: OrgNoteConfig['synchronization']['type'];
};

export const shouldTriggerSyncForAction = (actionName: string): boolean =>
  SYNC_TRIGGER_FS_ACTIONS.has(actionName);

export const isSyncAllowedForUser = (state: SyncGateState): boolean =>
  !!state.active && state.syncType !== DEFAULT_CONFIG.synchronization.type;

export default defineBoot(({ store }) => {
  const authStore = useAuthStore(store);
  const configStore = useConfigStore(store);
  const syncStore = useSyncStore(store);
  const fileSystemStore = useFileSystemStore(store);

  const runDebouncedSync = debounce(async () => {
    if (
      !isSyncAllowedForUser({
        active: authStore.user?.active,
        syncType: configStore.config.synchronization.type,
      })
    ) {
      return;
    }

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
