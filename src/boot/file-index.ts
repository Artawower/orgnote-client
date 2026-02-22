import { defineBoot } from '@quasar/app-vite/wrappers';
import { DefaultCommands, isOrgFile, join } from 'orgnote-api';
import type { FileSystemChange } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileWatcherStore } from 'src/stores/file-watcher';
import { useFileSearchStore } from 'src/stores/file-search';
import { useFileSystemStore } from 'src/stores/file-system';
import { repositories } from 'src/boot/repositories';

const pendingChanges: FileSystemChange[] = [];

const parseFilePath = (path: string): string[] => path.split('/').filter(Boolean);

const isRelevantChange = (change: FileSystemChange): boolean => {
  const hasOrgPath = isOrgFile(change.path);
  const hasRenameWithPreviousPath = change.type === 'rename' && !!change.previousPath;
  return hasOrgPath || hasRenameWithPreviousPath;
};

export default defineBoot(async ({ store }) => {
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

  initSearch();
});

const initSearch = async (): Promise<void> => {
  const commandsStore = useCommandsStore();
  commandsStore.execute(DefaultCommands.INIT_SEARCH_INDEX);
};

const setupIndexingWatcher = (): void => {
  const fileSearch = useFileSearchStore();
  const { isIndexing } = storeToRefs(fileSearch);

  watch(isIndexing, async (isCurrentlyIndexing) => {
    if (!isCurrentlyIndexing) {
      await processPendingChanges();
    }
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

const normalizePathPrefix = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

const isPathWithinPrefix = (path: string, prefix: string): boolean =>
  path === prefix.slice(0, -1) || path.startsWith(prefix);

const toAbsoluteFilePath = (pathSegments: string[]): string => join('/', ...pathSegments);

const listOrgFilesRecursively = async (path: string): Promise<string[]> => {
  const fs = useFileSystemStore();
  const entries = await fs.readDir(path);

  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (entry.type === 'directory') {
        return listOrgFilesRecursively(entry.path);
      }

      if (isOrgFile(entry.name)) {
        return [entry.path];
      }

      return [];
    }),
  );

  return nested.flat();
};

const handleDirectoryRename = async (change: FileSystemChange): Promise<void> => {
  if (!change.previousPath) {
    return;
  }

  const fileSearch = useFileSearchStore();
  const oldPrefix = normalizePathPrefix(change.previousPath);
  const allFiles = await repositories.fileRepository.getAll();
  const staleFiles = allFiles.filter((file) =>
    isPathWithinPrefix(toAbsoluteFilePath(file.filePath), oldPrefix),
  );

  await Promise.all(staleFiles.map((file) => fileSearch.removeFile({ id: file.id })));

  const orgFilesInNewPath = await listOrgFilesRecursively(change.path);
  await Promise.all(orgFilesInNewPath.map((filePath) => fileSearch.indexFile(filePath)));
};

const setupOrgFileWatcher = (fileWatcher: ReturnType<typeof useFileWatcherStore>): void => {
  fileWatcher.watch('/', handleFileChange, { recursive: true });
};

const handleFileChange = async (change: FileSystemChange): Promise<void> => {
  if (!isRelevantChange(change)) {
    return;
  }

  const fileSearch = useFileSearchStore();

  if (fileSearch.isIndexing) {
    pendingChanges.push(change);
    return;
  }

  await processChange(change);
};

const processChange = async (change: FileSystemChange): Promise<void> => {
  const fileSearch = useFileSearchStore();
  const fs = useFileSystemStore();

  const newPathInfo = change.type === 'rename' ? await fs.fileInfo(change.path) : undefined;

  const isDirectoryRename =
    change.type === 'rename' &&
    !!change.previousPath &&
    newPathInfo?.type === 'directory' &&
    !isOrgFile(change.path) &&
    !isOrgFile(change.previousPath);

  if (isDirectoryRename) {
    await handleDirectoryRename(change);
    return;
  }

  if (change.type === 'rename') {
    if (change.previousPath && isOrgFile(change.previousPath)) {
      await fileSearch.removeFile({ path: parseFilePath(change.previousPath) });
    }

    if (isOrgFile(change.path)) {
      await fileSearch.indexFile(change.path);
    }

    return;
  }

  if (change.type === 'delete') {
    await fileSearch.removeFile({ path: parseFilePath(change.path) });
    return;
  }

  await fileSearch.indexFile(change.path);
};
