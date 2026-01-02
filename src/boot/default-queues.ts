import { boot } from 'quasar/wrappers';
import { useQueueStore } from 'src/stores/queue';
import { createQueueTaskProcessor, createSyncExecutor } from 'src/infrastructure/sync';
import type { SyncContextProvider } from 'src/infrastructure/sync';
import { createSyncState } from 'src/utils/sync-state';
import { useFileSystemManagerStore } from 'src/stores/file-system-manager';
import { useSyncStore } from 'src/stores/sync';
import { storeToRefs } from 'pinia';
import type { FileSystem, ProcessFn } from 'orgnote-api';
import { useFileSearchStore } from 'src/stores/file-search';
import { INDEX_QUEUE_ID, SYNC_QUEUE_ID } from 'src/constants/queue-ids';

const createSyncContextProvider = (): SyncContextProvider => ({
  getContext: (serverTime: string) => {
    const fsManager = useFileSystemManagerStore();
    const fs = fsManager.currentFs as FileSystem;
    if (!fs) return null;

    const syncStore = useSyncStore();
    const { stateData } = storeToRefs(syncStore);
    const state = createSyncState(stateData);

    return {
      executor: createSyncExecutor(fs),
      state,
      fs,
      serverTime,
    };
  },
});

const isValidIndexTask = (task: unknown): task is { payload: { filePath: string } } => {
  if (!task || typeof task !== 'object') return false;
  const t = task as Record<string, unknown>;
  if (!t.payload || typeof t.payload !== 'object') return false;
  const p = t.payload as Record<string, unknown>;
  return typeof p.filePath === 'string';
};

const createIndexProcessor = (): ProcessFn => {
  return (task: unknown, cb: (err?: unknown, result?: unknown) => void): void => {
    if (!isValidIndexTask(task)) {
      cb(new Error('Invalid index task payload'));
      return;
    }

    const { payload } = task;
    const fileSearch = useFileSearchStore();

    fileSearch
      .processFile(payload.filePath)
      .then(() => cb(undefined, { indexed: payload.filePath }))
      .catch(cb);
  };
};

export default boot(() => {
  const queueStore = useQueueStore();
  const provider = createSyncContextProvider();

  queueStore.register(SYNC_QUEUE_ID, {
    concurrent: 1,
    maxRetries: 2,
    retryDelay: 1000,
    failTaskOnProcessException: true,
    process: createQueueTaskProcessor(provider),
  });

  queueStore.register(INDEX_QUEUE_ID, {
    concurrent: 1,
    maxRetries: 2,
    retryDelay: 1000,
    failTaskOnProcessException: true,
    process: createIndexProcessor(),
  });
});
