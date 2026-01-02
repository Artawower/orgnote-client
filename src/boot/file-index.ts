import { defineBoot } from '@quasar/app-vite/wrappers';
import { DefaultCommands, isOrgFile } from 'orgnote-api';
import type { FileSystemChange } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileWatcherStore } from 'src/stores/file-watcher';
import { useFileSearchStore } from 'src/stores/file-search';

const pendingChanges: FileSystemChange[] = [];

export default defineBoot(async ({ store }) => {
  await initSearch();
  setupIndexingWatcher();

  const fileWatcher = useFileWatcherStore(store);
  const { isWatching } = storeToRefs(fileWatcher);

  const stopWatch = watch(
    isWatching,
    (watching) => {
      if (!watching) return;
      stopWatch();
      setupOrgFileWatcher(fileWatcher);
    },
    { immediate: true },
  );
});

const initSearch = async (): Promise<void> => {
  const commandsStore = useCommandsStore();
  await commandsStore.execute(DefaultCommands.INIT_SEARCH_INDEX);
};

const setupIndexingWatcher = (): void => {
  const fileSearch = useFileSearchStore();
  const { isIndexing } = storeToRefs(fileSearch);

  watch(isIndexing, async (indexing) => {
    if (indexing) return;
    await processPendingChanges();
  });
};

const processPendingChanges = async (): Promise<void> => {
  while (pendingChanges.length > 0) {
    const change = pendingChanges.shift();
    if (change) {
      await processChange(change);
    }
  }
};

const setupOrgFileWatcher = (fileWatcher: ReturnType<typeof useFileWatcherStore>): void => {
  fileWatcher.watch('/', handleFileChange, { recursive: true });
};

const handleFileChange = async (change: FileSystemChange): Promise<void> => {
  if (!isOrgFile(change.path)) return;

  const fileSearch = useFileSearchStore();

  if (fileSearch.isIndexing) {
    pendingChanges.push(change);
    return;
  }

  await processChange(change);
};

const processChange = async (change: FileSystemChange): Promise<void> => {
  const fileSearch = useFileSearchStore();

  if (change.type === 'delete') {
    await fileSearch.removeFile({ path: change.path.split('/').filter(Boolean) });
    return;
  }

  await fileSearch.indexFile(change.path);
};
