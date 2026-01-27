import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import {
  to,
  type DiskFile,
  type FileSystemChange,
  type FileSystemChangeType,
  type FileWatcherListener,
  type FileWatcherStartOptions,
  type FileWatcherStore,
  type FileWatcherWatchOptions,
  type WatcherHandle,
} from 'orgnote-api';
import { useFileSystemManagerStore } from './file-system-manager';
import { useFileSystemStore } from './file-system';
import { reporter } from 'src/boot/report';

type PathFilter = (path: string) => boolean;

type Snapshot = Map<string, number>;

interface PathSubscription {
  path: string;
  listener: FileWatcherListener;
  recursive: boolean;
}

// TODO: feat/sockets move to config
const DEFAULT_INTERVAL = 3000;
const BACKOFF_MULTIPLIER = 2;
const MAX_BACKOFF_MULTIPLIER = 8;

const createChange = (
  path: string,
  type: FileSystemChangeType,
  mtime?: number,
): FileSystemChange => ({ path, type, mtime });

const detectCreatedFiles = (current: Snapshot, previous: Snapshot): FileSystemChange[] =>
  [...current.entries()]
    .filter(([path]) => !previous.has(path))
    .map(([path, mtime]) => createChange(path, 'create', mtime));

const detectModifiedFiles = (current: Snapshot, previous: Snapshot): FileSystemChange[] =>
  [...current.entries()]
    .filter(([path, mtime]) => {
      const prevMtime = previous.get(path);
      return prevMtime !== undefined && prevMtime !== mtime;
    })
    .map(([path, mtime]) => createChange(path, 'modify', mtime));

const detectDeletedFiles = (current: Snapshot, previous: Snapshot): FileSystemChange[] =>
  [...previous.keys()]
    .filter((path) => !current.has(path))
    .map((path) => createChange(path, 'delete'));

const computeChanges = (current: Snapshot, previous: Snapshot): FileSystemChange[] => [
  ...detectCreatedFiles(current, previous),
  ...detectModifiedFiles(current, previous),
  ...detectDeletedFiles(current, previous),
];

const isValidInterval = (value?: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const fileToSnapshotEntry = (file: DiskFile): [string, number] => [file.path, file.mtime];

const applyPathFilter = (files: DiskFile[], filter?: PathFilter): DiskFile[] =>
  filter ? files.filter((file) => filter(file.path)) : files;

const getDirectories = (files: DiskFile[]): DiskFile[] =>
  files.filter((f) => f.type === 'directory');

const addFilesToSnapshot = (snapshot: Snapshot, files: DiskFile[], filter?: PathFilter): void => {
  applyPathFilter(files, filter).forEach((file) => {
    const [path, mtime] = fileToSnapshotEntry(file);
    snapshot.set(path, mtime);
  });
};

const scanDirectory = async (
  fs: ReturnType<typeof useFileSystemStore>,
  dirPath: string,
  snapshot: Snapshot,
  filter?: PathFilter,
): Promise<void> => {
  const files = await fs.readDir(dirPath);
  addFilesToSnapshot(snapshot, files, filter);

  const directories = getDirectories(files);
  await Promise.all(directories.map((dir) => scanDirectory(fs, dir.path, snapshot, filter)));
};

const buildSnapshot = async (
  fs: ReturnType<typeof useFileSystemStore>,
  filter?: PathFilter,
): Promise<Snapshot> => {
  const snapshot = new Map<string, number>();
  await scanDirectory(fs, '/', snapshot, filter);
  return snapshot;
};

const hasNativeWatch = (fsManager: ReturnType<typeof useFileSystemManagerStore>): boolean =>
  !!fsManager.currentFs?.watch;

const isFirstLevelChild = (changePath: string, watchPath: string): boolean => {
  const relativePath = changePath.slice(watchPath.length);
  return !relativePath.includes('/');
};

const isPathMatch = (changePath: string, watchPath: string, recursive: boolean): boolean => {
  if (changePath === watchPath) {
    return true;
  }

  const normalizedWatchPath = watchPath.endsWith('/') ? watchPath : `${watchPath}/`;
  const isInside = changePath.startsWith(normalizedWatchPath);

  if (!isInside) {
    return false;
  }

  if (recursive) {
    return true;
  }

  return isFirstLevelChild(changePath, normalizedWatchPath);
};

const findMatchingSubscriptions = (
  change: FileSystemChange,
  subscriptions: PathSubscription[],
): PathSubscription[] =>
  subscriptions.filter((sub) => isPathMatch(change.path, sub.path, sub.recursive));

export const useFileWatcherStore = defineStore<'file-watcher', FileWatcherStore>(
  'file-watcher',
  () => {
    const fsManager = useFileSystemManagerStore();
    const fs = useFileSystemStore();

    const isWatching = ref(false);
    const snapshot = shallowRef<Snapshot>(new Map());
    const subscriptions = ref<PathSubscription[]>([]);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let nativeWatcherHandle: WatcherHandle | null = null;
    let currentOptions: FileWatcherStartOptions = {};
    let isScanning = false;
    let idleScans = 0;
    let currentInterval = DEFAULT_INTERVAL;
    let baseInterval = DEFAULT_INTERVAL;
    let maxInterval = DEFAULT_INTERVAL * MAX_BACKOFF_MULTIPLIER;

    const notifySubscribers = (change: FileSystemChange): void => {
      const matching = findMatchingSubscriptions(change, subscriptions.value);
      matching.forEach((sub) => sub.listener(change));
    };

    const matchesFilter = (path: string): boolean => {
      if (!currentOptions.fileFilter) {
        return true;
      }
      return currentOptions.fileFilter(path);
    };

    const handleNativeChange = (change: FileSystemChange): void => {
      if (!matchesFilter(change.path)) {
        return;
      }
      notifySubscribers(change);
    };

    const performScan = async (): Promise<{ changes: number; files: number }> => {
      const previousSnapshot = snapshot.value;
      const currentSnapshot = await buildSnapshot(fs, currentOptions.fileFilter);
      const detected = computeChanges(currentSnapshot, previousSnapshot);

      snapshot.value = currentSnapshot;
      detected.forEach(notifySubscribers);

      return {
        changes: detected.length,
        files: currentSnapshot.size,
      };
    };

    const buildScanResult = async (): Promise<{ changes: number; files: number } | null> => {
      const result = await to(performScan)();
      if (result.isOk()) {
        return result.value;
      }
      reporter.reportResult(result, 'file watcher scan failed');
      return null;
    };

    const scan = async (): Promise<number | null> => {
      if (isScanning) {
        return null;
      }
      isScanning = true;
      const result = await buildScanResult();
      isScanning = false;
      if (!result) {
        return null;
      }
      return result.changes;
    };

    const startNativeWatch = async (): Promise<boolean> => {
      if (!hasNativeWatch(fsManager)) {
        return false;
      }

      const handle = await fsManager.currentFs!.watch!(handleNativeChange);
      nativeWatcherHandle = handle;
      return true;
    };

    const updateInterval = (changes: number | null): void => {
      if (changes && changes > 0) {
        idleScans = 0;
        currentInterval = baseInterval;
        return;
      }
      idleScans += 1;
      currentInterval = Math.min(baseInterval * BACKOFF_MULTIPLIER ** idleScans, maxInterval);
    };

    const scheduleNext = (delay: number): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(async () => {
        const changes = await scan();
        updateInterval(changes);
        scheduleNext(currentInterval);
      }, delay);
    };

    const startPolling = (): void => {
      baseInterval = currentOptions.interval ?? DEFAULT_INTERVAL;
      maxInterval = baseInterval * MAX_BACKOFF_MULTIPLIER;
      currentInterval = baseInterval;
      idleScans = 0;

      scheduleNext(0);
    };

    const start = async (options: FileWatcherStartOptions = {}): Promise<void> => {
      if (isWatching.value) {
        return;
      }

      currentOptions = normalizeStartOptions(options);
      isWatching.value = true;

      const nativeStarted = await startNativeWatch();
      if (nativeStarted) {
        return;
      }

      startPolling();
    };

    const stopNativeWatch = async (): Promise<void> => {
      if (!nativeWatcherHandle) {
        return;
      }
      await nativeWatcherHandle.stop();
      nativeWatcherHandle = null;
    };

    const stopPolling = (): void => {
      if (!timeoutId) {
        return;
      }
      clearTimeout(timeoutId);
      timeoutId = null;
    };

    const stop = async (): Promise<void> => {
      await stopNativeWatch();
      stopPolling();
      isWatching.value = false;
      snapshot.value = new Map();
      subscriptions.value = [];
    };

    const watch = (
      path: string,
      listener: FileWatcherListener,
      options: FileWatcherWatchOptions = {},
    ): (() => void) => {
      const subscription: PathSubscription = {
        path,
        listener,
        recursive: options.recursive ?? false,
      };

      subscriptions.value = [...subscriptions.value, subscription];

      return () => {
        subscriptions.value = subscriptions.value.filter((s) => s !== subscription);
      };
    };

    const store: FileWatcherStore = {
      isWatching,
      start,
      stop,
      watch,
    };

    return store;
  },
);
const normalizeInterval = (interval?: number): number => {
  if (isValidInterval(interval)) {
    return interval;
  }
  if (interval === undefined) {
    return DEFAULT_INTERVAL;
  }
  reporter.reportWarning(new Error('file watcher invalid interval'));
  return DEFAULT_INTERVAL;
};

const normalizeFileFilter = (filter?: PathFilter): PathFilter | undefined => {
  if (!filter) {
    return undefined;
  }
  if (typeof filter === 'function') {
    return filter;
  }
  reporter.reportWarning(new Error('file watcher invalid file filter'));
  return undefined;
};

const normalizeStartOptions = (options: FileWatcherStartOptions): FileWatcherStartOptions => ({
  ...options,
  interval: normalizeInterval(options.interval),
  fileFilter: normalizeFileFilter(options.fileFilter),
});
