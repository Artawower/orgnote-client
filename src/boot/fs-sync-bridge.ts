import { defineBoot } from '#q-app/wrappers';
import { getExtensionRuntimeRootPath, isSyncConflictPath, toAbsolutePath } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import {
  FILE_MUTATION_OPERATION,
  type FileMutation,
  type FileMutationOperation,
} from 'src/models/file-mutation';
import { onFileMutation } from 'src/stores/file-mutation-events';
import { useSyncStore } from 'src/stores/sync';
import { debounce } from 'src/utils/debounce';
import { isPathInsideRoot } from 'src/utils/is-path-inside-root';

// TODO: move to config
const FS_SYNC_DEBOUNCE_MS = 1200;
const CONFLICT_ARTIFACT_OPERATIONS = new Set<FileMutationOperation>([
  FILE_MUTATION_OPERATION.WRITE,
  FILE_MUTATION_OPERATION.DELETE,
]);

const isExtensionRuntimePath = (path: string): boolean =>
  isPathInsideRoot(toAbsolutePath(path), toAbsolutePath(getExtensionRuntimeRootPath()));

const isConflictArtifactPath = (mutation: FileMutation, path: string): boolean =>
  CONFLICT_ARTIFACT_OPERATIONS.has(mutation.operation) && isSyncConflictPath(path);

export const shouldTriggerSyncForMutation = (mutation: FileMutation): boolean =>
  mutation.paths.some(
    (path) => !isExtensionRuntimePath(path) && !isConflictArtifactPath(mutation, path),
  );

export default defineBoot(({ store }) => {
  const syncStore = useSyncStore(store);
  const runDebouncedSync = debounce(async () => {
    const result = await to(() => syncStore.sync(), 'Failed to sync after fs action')();
    if (result.isErr()) reporter.reportWarning(result.error);
  }, FS_SYNC_DEBOUNCE_MS);

  onFileMutation((mutation) => {
    if (!shouldTriggerSyncForMutation(mutation)) return;
    runDebouncedSync();
  });
});
