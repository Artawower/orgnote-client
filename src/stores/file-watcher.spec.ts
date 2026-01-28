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

const mocks = vi.hoisted(() => ({
  readDirResults: [] as TestDiskFile[],
  reportWarning: vi.fn(),
  reportResult: vi.fn(),
}));

const readDir = async (): Promise<TestDiskFile[]> => mocks.readDirResults;

vi.mock('src/stores/file-system', () => ({
  useFileSystemStore: vi.fn(() => ({
    readDir,
  })),
}));

vi.mock('src/stores/file-system-manager', () => ({
  useFileSystemManagerStore: vi.fn(() => ({
    currentFs: { watch: undefined },
  })),
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportWarning: mocks.reportWarning,
    reportResult: mocks.reportResult,
  },
}));

const createFile = (path: string): TestDiskFile => ({
  name: path.split('/').pop() ?? path,
  path,
  type: 'file',
  size: 0,
  mtime: 0,
});

beforeEach(() => {
  setActivePinia(createPinia());
  mocks.readDirResults = [];
  mocks.reportWarning.mockReset();
  mocks.reportResult.mockReset();
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
