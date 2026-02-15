import 'fake-indexeddb/auto';
import { setActivePinia, createPinia } from 'pinia';
import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import type { DiskFile, FileSystemChange } from 'orgnote-api';

const mockFs = {
  readDir: vi.fn(async (): Promise<DiskFile[]> => []),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  deleteFile: vi.fn(),
  rename: vi.fn(),
  copyFile: vi.fn(),
};

let watcherCallbacks: Map<string, (change: FileSystemChange) => void>;

const mockFileWatcher = {
  watch: vi.fn((path: string, callback: (change: FileSystemChange) => void) => {
    watcherCallbacks.set(path, callback);
    return () => watcherCallbacks.delete(path);
  }),
};

vi.mock('./file-system', () => ({
  useFileSystemStore: () => mockFs,
}));

vi.mock('./file-watcher', () => ({
  useFileWatcherStore: () => mockFileWatcher,
}));

import { useFileManagerStore } from './file-manager';

const createDiskFile = (overrides: Partial<DiskFile>): DiskFile =>
  ({
    path: '/test/file',
    name: 'file',
    type: 'file',
    mtime: 1,
    ...overrides,
  }) as DiskFile;

beforeEach(() => {
  vi.useFakeTimers();
  setActivePinia(createPinia());
  vi.clearAllMocks();
  watcherCallbacks = new Map();
});

afterEach(() => {
  vi.useRealTimers();
});

test('toggleSelection adds path when not selected', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/docs/note.org');

  expect(store.selectedFiles.has('/docs/note.org')).toBe(true);
  expect(store.selectedFiles.size).toBe(1);
});

test('toggleSelection removes path when already selected', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/docs/note.org');
  store.toggleSelection('/docs/note.org');

  expect(store.selectedFiles.has('/docs/note.org')).toBe(false);
  expect(store.selectedFiles.size).toBe(0);
});

test('clearSelection empties selected files and disables selectionMode', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/a.org');
  store.toggleSelection('/b.org');
  expect(store.selectionMode).toBe(true);

  store.clearSelection();

  expect(store.selectedFiles.size).toBe(0);
  expect(store.selectionMode).toBe(false);
});

test('selectionMode is false when no files selected', () => {
  const store = useFileManagerStore();

  expect(store.selectionMode).toBe(false);
});

test('selectionMode is true when files are selected', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/a.org');

  expect(store.selectionMode).toBe(true);
});

test('selectFiles selects all items including directories', () => {
  const store = useFileManagerStore();

  const files: DiskFile[] = [
    createDiskFile({ path: '/docs/note.org', name: 'note.org', type: 'file' }),
    createDiskFile({ path: '/docs/images', name: 'images', type: 'directory' }),
    createDiskFile({ path: '/docs/todo.org', name: 'todo.org', type: 'file' }),
  ];

  store.selectFiles(files);

  expect(store.selectedFiles.size).toBe(3);
  expect(store.selectedFiles.has('/docs/note.org')).toBe(true);
  expect(store.selectedFiles.has('/docs/images')).toBe(true);
  expect(store.selectedFiles.has('/docs/todo.org')).toBe(true);
});

test('selectFiles replaces previous selection', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/old/file.org');
  expect(store.selectedFiles.size).toBe(1);

  const files: DiskFile[] = [
    createDiskFile({ path: '/new/a.org', name: 'a.org', type: 'file' }),
    createDiskFile({ path: '/new/b.org', name: 'b.org', type: 'file' }),
  ];

  store.selectFiles(files);

  expect(store.selectedFiles.size).toBe(2);
  expect(store.selectedFiles.has('/old/file.org')).toBe(false);
  expect(store.selectedFiles.has('/new/a.org')).toBe(true);
  expect(store.selectedFiles.has('/new/b.org')).toBe(true);
});

test('operationTargets returns selected files when selection exists', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/a.org');
  store.toggleSelection('/b.org');

  expect(store.operationTargets).toEqual(['/a.org', '/b.org']);
});

test('operationTargets returns focusFile path when no selection', () => {
  const store = useFileManagerStore();
  store.focusFile = createDiskFile({ path: '/focused.org', name: 'focused.org' });

  expect(store.operationTargets).toEqual(['/focused.org']);
});

test('operationTargets returns empty array when no selection and no focusFile', () => {
  const store = useFileManagerStore();

  expect(store.operationTargets).toEqual([]);
});

test('startCopy sets pending copy operation and clears selection', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/a.org');
  store.startCopy(['/a.org']);

  expect(store.pendingOperation).toEqual({ type: 'copy', paths: ['/a.org'] });
  expect(store.selectedFiles.size).toBe(0);
});

test('startMove sets pending move operation and clears selection', () => {
  const store = useFileManagerStore();

  store.toggleSelection('/a.org');
  store.startMove(['/a.org']);

  expect(store.pendingOperation).toEqual({ type: 'move', paths: ['/a.org'] });
  expect(store.selectedFiles.size).toBe(0);
});

test('executePending calls copyFile for copy operation and resets pending', async () => {
  const store = useFileManagerStore();

  store.startCopy(['/src/a.org', '/src/b.org']);
  await store.executePending('/dest');

  expect(mockFs.copyFile).toHaveBeenCalledWith('/src/a.org', '/dest/a.org');
  expect(mockFs.copyFile).toHaveBeenCalledWith('/src/b.org', '/dest/b.org');
  expect(mockFs.copyFile).toHaveBeenCalledTimes(2);
  expect(store.pendingOperation).toBeUndefined();
});

test('executePending calls rename for move operation and resets pending', async () => {
  const store = useFileManagerStore();

  store.startMove(['/src/file.org']);
  await store.executePending('/dest');

  expect(mockFs.rename).toHaveBeenCalledWith('/src/file.org', '/dest/file.org');
  expect(mockFs.rename).toHaveBeenCalledTimes(1);
  expect(store.pendingOperation).toBeUndefined();
});

test('executePending does nothing when no pending operation', async () => {
  const store = useFileManagerStore();

  await store.executePending('/dest');

  expect(mockFs.copyFile).not.toHaveBeenCalled();
  expect(mockFs.rename).not.toHaveBeenCalled();
});

test('cancelPending resets pending operation', () => {
  const store = useFileManagerStore();

  store.startCopy(['/a.org']);
  expect(store.pendingOperation).toBeDefined();

  store.cancelPending();

  expect(store.pendingOperation).toBeUndefined();
});

test('deleteFiles calls deleteFile for each path and clears selection', async () => {
  const store = useFileManagerStore();

  store.toggleSelection('/a.org');
  store.toggleSelection('/b.org');
  await store.deleteFiles(['/a.org', '/b.org']);

  expect(mockFs.deleteFile).toHaveBeenCalledWith('/a.org');
  expect(mockFs.deleteFile).toHaveBeenCalledWith('/b.org');
  expect(mockFs.deleteFile).toHaveBeenCalledTimes(2);
  expect(store.selectedFiles.size).toBe(0);
});

test('executePending clears selection after copy', async () => {
  const store = useFileManagerStore();

  store.toggleSelection('/other.org');
  store.startCopy(['/src/a.org']);
  store.toggleSelection('/stale.org');
  await store.executePending('/dest');

  expect(store.selectedFiles.size).toBe(0);
});

test('loadFiles populates files from filesystem', async () => {
  const store = useFileManagerStore();
  mockFs.readDir.mockClear();

  const fileA = createDiskFile({ path: '/a.org', name: 'a.org' });
  const fileB = createDiskFile({ path: '/b.org', name: 'b.org' });
  mockFs.readDir.mockResolvedValueOnce([fileA, fileB]);

  await store.loadFiles();

  expect(store.files).toEqual([fileA, fileB]);
  expect(mockFs.readDir).toHaveBeenCalledWith('/');
});

test('sortedFiles returns files sorted by default config (name asc, directories first)', () => {
  const store = useFileManagerStore();

  const dir = createDiskFile({ name: 'zulu', path: '/zulu', type: 'directory' });
  const fileA = createDiskFile({ name: 'b.org', path: '/b.org' });
  const fileB = createDiskFile({ name: 'a.org', path: '/a.org' });
  store.files = [fileA, fileB, dir];

  expect(store.sortedFiles.map((f) => f.name)).toEqual(['zulu', 'a.org', 'b.org']);
});

test('sortedFiles reacts to sortConfig changes', () => {
  const store = useFileManagerStore();

  const fileSmall = createDiskFile({ name: 'small.org', path: '/small.org', size: 10 });
  const fileLarge = createDiskFile({ name: 'large.org', path: '/large.org', size: 999 });
  store.files = [fileSmall, fileLarge];

  store.sortConfig = { field: 'size', direction: 'desc', directoriesFirst: false };

  expect(store.sortedFiles.map((f) => f.name)).toEqual(['large.org', 'small.org']);
});

test('sortedFiles reacts to files changes', () => {
  const store = useFileManagerStore();

  store.files = [createDiskFile({ name: 'c.org', path: '/c.org' })];
  expect(store.sortedFiles.length).toBe(1);

  store.files = [
    createDiskFile({ name: 'c.org', path: '/c.org' }),
    createDiskFile({ name: 'a.org', path: '/a.org' }),
  ];
  expect(store.sortedFiles.map((f) => f.name)).toEqual(['a.org', 'c.org']);
});

test('sortConfig defaults to name ascending with directories first', () => {
  const store = useFileManagerStore();

  expect(store.sortConfig).toEqual({
    field: 'name',
    direction: 'asc',
    directoriesFirst: true,
  });
});

test('createFile uses files ref instead of re-reading directory', async () => {
  const store = useFileManagerStore();
  mockFs.readDir.mockClear();
  store.files = [createDiskFile({ name: 'existing.org', path: '/docs/existing.org' })];

  await store.createFile();

  expect(mockFs.readDir).not.toHaveBeenCalled();
  expect(mockFs.writeFile).toHaveBeenCalled();
});

test('createFolder uses files ref instead of re-reading directory', async () => {
  const store = useFileManagerStore();
  mockFs.readDir.mockClear();
  store.files = [createDiskFile({ name: 'existing', path: '/docs/existing', type: 'directory' })];

  await store.createFolder();

  expect(mockFs.readDir).not.toHaveBeenCalled();
  expect(mockFs.mkdir).toHaveBeenCalled();
});

test('store loads files and starts fileWatcher on init', () => {
  useFileManagerStore();

  expect(mockFs.readDir).toHaveBeenCalledWith('/');
  expect(mockFileWatcher.watch).toHaveBeenCalledWith('/', expect.any(Function), { recursive: false });
  expect(watcherCallbacks.has('/')).toBe(true);
});

test('store reloads files and switches fileWatcher when path changes', async () => {
  const store = useFileManagerStore();
  mockFs.readDir.mockClear();
  mockFileWatcher.watch.mockClear();

  store.path = '/docs';
  await nextTick();

  expect(mockFs.readDir).toHaveBeenCalledWith('/docs');
  expect(watcherCallbacks.has('/')).toBe(false);
  expect(watcherCallbacks.has('/docs')).toBe(true);
});

test('store refreshes files when fileWatcher notifies change', async () => {
  useFileManagerStore();
  mockFs.readDir.mockClear();

  const callback = watcherCallbacks.get('/');
  callback?.({ path: '/a.org', type: 'modify', mtime: 2 });
  await vi.advanceTimersByTimeAsync(150);

  expect(mockFs.readDir).toHaveBeenCalledWith('/');
});
