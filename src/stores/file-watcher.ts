import { defineStore } from 'pinia';
import { ref, shallowRef, watch as watchSource } from 'vue';
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
import { useSettingsStore } from './settings';
import { reporter } from 'src/boot/report';

type PathFilter = (path: string) => boolean;

type Snapshot = Map<string, number>;

interface PathSubscription {
  path: string;
  listener: FileWatcherListener;
  recursive: boolean;
}

const DEFAULT_INTERVAL = 3000;
const BACKOFF_MULTIPLIER = 2;
const MAX_BACKOFF_MULTIPLIER = 8;
const RECENT_CHANGE_TTL = 500;

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

const createChangeSignature = (change: FileSystemChange): string =>
  [change.type, change.path, change.previousPath ?? '', change.mtime ?? ''].join('\u0000');

export const useFileWatcherStore = defineStore<'file-watcher', FileWatcherStore>(
  'file-watcher',
  () => {
    const fsManager = useFileSystemManagerStore();
    const fs = useFileSystemStore();
    const settings = useSettingsStore();

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
    let runtimeGeneration = 0;
    let runtimeActive = false;
    const recentLocalChanges = new Map<string, number>();

    const nextRuntimeGeneration = (): number => {
      runtimeGeneration += 1;
      return runtimeGeneration;
    };

    const isCurrentGeneration = (generation: number): boolean => generation === runtimeGeneration;

    const pruneRecentLocalChanges = (now: number): void => {
      [...recentLocalChanges.entries()]
        .filter(([, ts]) => now - ts > RECENT_CHANGE_TTL)
        .forEach(([signature]) => recentLocalChanges.delete(signature));
    };

    const rememberLocalChange = (change: FileSystemChange): void => {
      const now = Date.now();
      pruneRecentLocalChanges(now);
      recentLocalChanges.set(createChangeSignature(change), now);
    };

    const isRecentLocalDuplicate = (change: FileSystemChange): boolean => {
      const now = Date.now();
      pruneRecentLocalChanges(now);
      const timestamp = recentLocalChanges.get(createChangeSignature(change));
      return timestamp !== undefined && now - timestamp <= RECENT_CHANGE_TTL;
    };

    const notifySubscribers = async (change: FileSystemChange): Promise<void> => {
      const matching = findMatchingSubscriptions(change, subscriptions.value);
      for (const sub of matching) {
        const result = await to(() => Promise.resolve(sub.listener(change)))();
        if (result.isErr()) reporter.reportError(result.error);
      }
    };

    const matchesFilter = (path: string): boolean => {
      if (!currentOptions.fileFilter) {
        return true;
      }
      return currentOptions.fileFilter(path);
    };

    const handleNativeChange = (change: FileSystemChange, generation: number): void => {
      if (!isCurrentGeneration(generation) || !matchesFilter(change.path)) {
        return;
      }
      if (isRecentLocalDuplicate(change)) {
        return;
      }
      notifySubscribers(change).catch((error) => {
        reporter.reportError(
          error instanceof Error ? error : new Error('file watcher native notify failed'),
        );
      });
    };

    const performScan = async (
      generation: number,
    ): Promise<{ changes: number; files: number } | null> => {
      const previousSnapshot = snapshot.value;
      const currentSnapshot = await buildSnapshot(fs, currentOptions.fileFilter);
      if (!isCurrentGeneration(generation)) {
        return null;
      }

      const detected = computeChanges(currentSnapshot, previousSnapshot);
      snapshot.value = currentSnapshot;
      for (const change of detected) {
        await notifySubscribers(change);
      }

      return {
        changes: detected.length,
        files: currentSnapshot.size,
      };
    };

    const recordSnapshot = (change: FileSystemChange): void => {
      if (change.type === 'delete') {
        const updated = new Map(snapshot.value);
        updated.delete(change.path);
        snapshot.value = updated;
        return;
      }
      if (change.mtime === undefined) return;
      const updated = new Map(snapshot.value);
      updated.set(change.path, change.mtime);
      snapshot.value = updated;
    };

    const emitChange = async (change: FileSystemChange): Promise<void> => {
      rememberLocalChange(change);
      await notifySubscribers(change);
      recordSnapshot(change);
    };

    const buildScanResult = async (
      generation: number,
    ): Promise<{ changes: number; files: number } | null> => {
      const result = await to(() => performScan(generation))();
      if (result.isOk()) {
        return result.value;
      }
      reporter.reportResult(result, 'file watcher scan failed');
      return null;
    };

    const scan = async (generation: number): Promise<number | null> => {
      if (isScanning) {
        return null;
      }
      isScanning = true;
      const result = await buildScanResult(generation);
      if (isCurrentGeneration(generation)) {
        isScanning = false;
      }
      if (!result || !isCurrentGeneration(generation)) {
        return null;
      }
      return result.changes;
    };

    const startNativeWatch = async (generation: number): Promise<boolean> => {
      if (!hasNativeWatch(fsManager)) {
        return false;
      }

      const handle = await fsManager.currentFs!.watch!(
        (change) => handleNativeChange(change, generation),
        {
          root: settings.settings.vault,
        },
      );

      if (!isCurrentGeneration(generation) || !runtimeActive) {
        await handle.stop();
        return true;
      }

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

    const scheduleNext = (delay: number, generation: number): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(async () => {
        const changes = await scan(generation);
        if (!isCurrentGeneration(generation) || !runtimeActive) {
          return;
        }
        updateInterval(changes);
        scheduleNext(currentInterval, generation);
      }, delay);
    };

    const startPolling = (generation: number): void => {
      baseInterval = currentOptions.interval ?? DEFAULT_INTERVAL;
      maxInterval = baseInterval * MAX_BACKOFF_MULTIPLIER;
      currentInterval = baseInterval;
      idleScans = 0;

      scheduleNext(0, generation);
    };

    const canStartRuntime = (): boolean => fsManager.fsMounted !== false;

    const startRuntimeForGeneration = async (generation: number): Promise<void> => {
      const nativeStarted = await startNativeWatch(generation);
      if (nativeStarted) {
        return;
      }

      startPolling(generation);
    };

    const resetFailedRuntimeStart = (generation: number): void => {
      if (!isCurrentGeneration(generation)) {
        return;
      }
      runtimeActive = false;
    };

    const startRuntime = async (): Promise<void> => {
      if (runtimeActive || !canStartRuntime()) {
        return;
      }

      const generation = runtimeGeneration;
      runtimeActive = true;
      const result = await to(() => startRuntimeForGeneration(generation))();
      if (result.isOk()) {
        return;
      }

      resetFailedRuntimeStart(generation);
      throw result.error;
    };

    const start = async (options: FileWatcherStartOptions = {}): Promise<void> => {
      if (isWatching.value && runtimeActive) {
        return;
      }

      currentOptions = normalizeStartOptions(options);
      isWatching.value = true;
      await startRuntime();
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

    const stopRuntime = async (): Promise<void> => {
      nextRuntimeGeneration();
      await stopNativeWatch();
      stopPolling();
      runtimeActive = false;
      isScanning = false;
      snapshot.value = new Map();
      recentLocalChanges.clear();
    };

    const restart = async (options: FileWatcherStartOptions = currentOptions): Promise<void> => {
      const shouldStart = isWatching.value;
      await stopRuntime();
      if (!shouldStart) {
        return;
      }
      currentOptions = options;
      await startRuntime();
    };

    const stop = async (): Promise<void> => {
      await stopRuntime();
      isWatching.value = false;
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

    watchSource(
      () => [fsManager.currentFsInfo?.name, settings.settings.vault, fsManager.fsMounted] as const,
      () => {
        if (!isWatching.value) {
          return;
        }
        void restart().catch((error) => {
          reporter.reportError(error instanceof Error ? error : new Error('file watcher restart failed'));
        });
      },
    );

    const store: FileWatcherStore = {
      isWatching,
      start,
      restart,
      stop,
      watch,
      emitChange,
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
