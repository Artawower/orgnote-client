import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useFileWatcherStore } from './file-watcher';

type TestDiskFile = {
  name: string;
  path: string;
  type: 'directory' | 'file';
  size: number;
  mtime: number;
};

type TestWatcherHandle = {
  stop: () => Promise<void> | void;
};

type TestNativeWatch = () => Promise<TestWatcherHandle>;

const mocks = vi.hoisted(() => ({
  readDir: vi.fn<() => Promise<TestDiskFile[]>>(),
  readDirResults: [] as TestDiskFile[],
  reportWarning: vi.fn(),
  reportResult: vi.fn(),
  reportError: vi.fn(),
  fsManager: {
    currentFs: { watch: undefined as TestNativeWatch | undefined },
    currentFsInfo: { name: 'mock-fs' },
    fsMounted: true,
  },
}));

const readDir = async (): Promise<TestDiskFile[]> => mocks.readDir();

vi.mock('src/stores/file-system', () => ({
  useFileSystemStore: vi.fn(() => ({
    readDir,
  })),
}));

vi.mock('src/stores/file-system-manager', () => ({
  useFileSystemManagerStore: vi.fn(() => mocks.fsManager),
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportWarning: mocks.reportWarning,
    reportResult: mocks.reportResult,
    reportError: mocks.reportError,
  },
}));

const createFile = (path: string): TestDiskFile => ({
  name: path.split('/').pop() ?? path,
  path,
  type: 'file',
  size: 0,
  mtime: 0,
});

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  setActivePinia(createPinia());
  mocks.readDirResults = [];
  mocks.readDir.mockReset();
  mocks.readDir.mockImplementation(async () => mocks.readDirResults);
  mocks.reportWarning.mockReset();
  mocks.reportResult.mockReset();
  mocks.reportError.mockReset();
  mocks.fsManager.currentFs = { watch: undefined };
  mocks.fsManager.currentFsInfo = { name: 'mock-fs' };
  mocks.fsManager.fsMounted = true;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

test('polling backs off on idle scans', async () => {
  const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
  mocks.readDirResults = [];

  const store = useFileWatcherStore();
  await store.start();

  await vi.runOnlyPendingTimersAsync();

  expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(0);
  expect(setTimeoutSpy.mock.calls[1]?.[1]).toBe(6000);

  await store.stop();
});

test('polling resets interval when changes detected', async () => {
  const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
  mocks.readDirResults = [createFile('/note.org')];

  const store = useFileWatcherStore();
  await store.start();

  await vi.runOnlyPendingTimersAsync();

  expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(0);
  expect(setTimeoutSpy.mock.calls[1]?.[1]).toBe(3000);

  await store.stop();
});

test('start uses default interval for invalid value', async () => {
  const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
  mocks.readDirResults = [];

  const store = useFileWatcherStore();
  await store.start({ interval: -1, fileFilter: 'bad' as unknown as (path: string) => boolean });

  await vi.runOnlyPendingTimersAsync();

  expect(mocks.reportWarning).toHaveBeenCalledTimes(2);
  expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(0);
  expect(setTimeoutSpy.mock.calls[1]?.[1]).toBe(6000);

  await store.stop();
});

test('restart preserves subscriptions', async () => {
  const listener = vi.fn();
  mocks.readDirResults = [createFile('/note.org')];

  const store = useFileWatcherStore();
  store.watch('/', listener, { recursive: true });

  await store.start();
  await store.restart();
  await vi.runOnlyPendingTimersAsync();

  expect(listener).toHaveBeenCalledWith({ path: '/note.org', type: 'create', mtime: 0 });

  await store.stop();
});

test('start waits until filesystem runtime is mounted', async () => {
  const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
  mocks.fsManager.fsMounted = false;

  const store = useFileWatcherStore();
  await store.start();

  expect(store.isWatching).toBe(true);
  expect(setTimeoutSpy).not.toHaveBeenCalled();

  mocks.fsManager.fsMounted = true;
  await store.restart();

  expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(0);

  await store.stop();
});

test('restart ignores stale polling scan results', async () => {
  const staleRead = createDeferred<TestDiskFile[]>();
  const listener = vi.fn();
  mocks.readDir.mockImplementationOnce(async () => staleRead.promise);

  const store = useFileWatcherStore();
  store.watch('/', listener, { recursive: true });
  await store.start();

  vi.runOnlyPendingTimers();
  await store.restart();

  staleRead.resolve([createFile('/stale.org')]);
  await Promise.resolve();
  await Promise.resolve();

  expect(listener).not.toHaveBeenCalled();

  await store.stop();
});

test('stops native watch handle that resolves after restart', async () => {
  const oldHandle = { stop: vi.fn(async () => undefined) };
  const newHandle = { stop: vi.fn(async () => undefined) };
  const oldWatch = createDeferred<TestWatcherHandle>();
  const watch = vi
    .fn<() => Promise<TestWatcherHandle>>()
    .mockImplementationOnce(async () => oldWatch.promise)
    .mockImplementationOnce(async () => newHandle);
  mocks.fsManager.currentFs = { watch };

  const store = useFileWatcherStore();
  const pendingStart = store.start();
  await Promise.resolve();

  await store.restart();
  oldWatch.resolve(oldHandle);
  await pendingStart;

  expect(oldHandle.stop).toHaveBeenCalledTimes(1);
  expect(newHandle.stop).not.toHaveBeenCalled();

  await store.stop();
});

test('native watch start failure does not block retry', async () => {
  const handle = { stop: vi.fn(async () => undefined) };
  const watch = vi
    .fn<() => Promise<TestWatcherHandle>>()
    .mockRejectedValueOnce(new Error('watch failed'))
    .mockResolvedValueOnce(handle);
  mocks.fsManager.currentFs = { watch };

  const store = useFileWatcherStore();
  await expect(store.start()).rejects.toThrow('watch failed');
  await store.start();

  expect(watch).toHaveBeenCalledTimes(2);

  await store.stop();
});
