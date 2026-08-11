import { defineBoot } from '#q-app/wrappers';
import { isSyncConflictPath } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { useFileSystemStore } from 'src/stores/file-system';
import { useSyncStore } from 'src/stores/sync';
import { debounce } from 'src/utils/debounce';
import { getExtensionRuntimeRootPath, toAbsolutePath } from 'orgnote-api';
import { isPathInsideRoot } from 'src/utils/is-path-inside-root';

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

const CONFLICT_ARTIFACT_ACTIONS = new Set<string>(['writeFile', 'deleteFile']);

const changesConflictArtifact = (
  actionName: string,
  args: unknown[]
): boolean =>
  CONFLICT_ARTIFACT_ACTIONS.has(actionName) &&
  typeof args[0] === 'string' &&
  isSyncConflictPath(args[0]);

const changesExtensionRuntime = (args: unknown[]): boolean =>
  typeof args[0] === 'string' &&
  isPathInsideRoot(toAbsolutePath(args[0]), toAbsolutePath(getExtensionRuntimeRootPath()));

export const shouldTriggerSyncForAction = (
  actionName: string,
  args: unknown[] = []
): boolean =>
  SYNC_TRIGGER_FS_ACTIONS.has(actionName) &&
  !changesConflictArtifact(actionName, args) &&
  !changesExtensionRuntime(args);

export default defineBoot(({ store }) => {
  const syncStore = useSyncStore(store);
  const fileSystemStore = useFileSystemStore(store);

  const runDebouncedSync = debounce(async () => {
    const result = await to(() => syncStore.sync(), 'Failed to sync after fs action')();
    if (result.isErr()) {
      reporter.reportWarning(result.error);
    }
  }, FS_SYNC_DEBOUNCE_MS);

  fileSystemStore.$onAction(({ name, args, after }) => {
    if (!shouldTriggerSyncForAction(name, args)) {
      return;
    }

    after(runDebouncedSync);
  });
});
