import { beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { DiskFile, FileSystem, FileSystemInfo } from 'orgnote-api';
import { useFileSystemManagerStore } from './file-system-manager';
import { useFileSystemStore } from './file-system';
import { useSettingsStore } from './settings';
import { useFileWatcherStore } from './file-watcher';
import { FILE_MUTATION_OPERATION } from 'src/models/file-mutation';
import { onFileMutation } from './file-mutation-events';

const createDiskFile = (path: string, mtime: number): DiskFile => ({
  path,
  mtime,
  name: path.split('/').pop() ?? '',
  type: 'file',
  size: 0,
});

const createReadFile = (utf8Content: string): FileSystem['readFile'] => {
  const readFile: FileSystem['readFile'] = async (path, encoding) => {
    void path;
    if (encoding === 'binary') {
      return new TextEncoder().encode(utf8Content) as never;
    }
    return utf8Content as never;
  };
  return readFile;
};

beforeEach(() => {
  setActivePinia(createPinia());
});

test('writeFile does not emit changes for extension runtime files', async () => {
  const mockFs: FileSystem = {
    readFile: createReadFile(''),
    writeFile: vi.fn(async () => undefined),
    readDir: vi.fn(async () => []),
    fileInfo: vi.fn(async (path: string) => createDiskFile(path, 100)),
    rename: vi.fn(async () => undefined),
    deleteFile: vi.fn(async () => undefined),
    rmdir: vi.fn(async () => undefined),
    mkdir: vi.fn(async () => undefined),
    isDirExist: vi.fn(async () => true),
    isFileExist: vi.fn(async () => true),
    utimeSync: vi.fn(async () => undefined),
  };
  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => mockFs,
    type: 'web',
    initialVault: '/',
  };
  useSettingsStore().settings.vault = '/';
  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';
  const emitChange = vi.spyOn(useFileWatcherStore(), 'emitChange');
  const store = useFileSystemStore();
  const mutationListener = vi.fn();
  const stopListening = onFileMutation(mutationListener);

  await store.writeFile('.orgnote/extensions/excalidraw/0.1.1/index.js', '');
  stopListening();

  expect(mockFs.writeFile).toHaveBeenCalledOnce();
  expect(mutationListener).toHaveBeenCalledWith({
    operation: FILE_MUTATION_OPERATION.WRITE,
    paths: ['/.orgnote/extensions/excalidraw/0.1.1/index.js'],
  });
  expect(mockFs.fileInfo).not.toHaveBeenCalled();
  expect(emitChange).not.toHaveBeenCalled();
});

test('syncFile returns disk content when disk is newer', async () => {
  const mockFs: FileSystem = {
    readFile: createReadFile('disk-content'),
    writeFile: vi.fn(async () => undefined),
    readDir: vi.fn(async () => []),
    fileInfo: vi.fn(async (path: string) => createDiskFile(path, 200)),
    rename: vi.fn(async () => undefined),
    deleteFile: vi.fn(async () => undefined),
    rmdir: vi.fn(async () => undefined),
    mkdir: vi.fn(async () => undefined),
    isDirExist: vi.fn(async () => true),
    isFileExist: vi.fn(async () => true),
    utimeSync: vi.fn(async () => undefined),
  };
  const readFileSpy = vi.spyOn(mockFs, 'readFile');

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => mockFs,
    type: 'web',
    initialVault: '/',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useFileSystemStore();

  const result = await store.syncFile('test.txt', 'store-content', 100);

  expect(result).toBe('disk-content');
  expect(readFileSpy).toHaveBeenCalledWith('/test.txt', 'utf8');
  expect(mockFs.writeFile).not.toHaveBeenCalled();
});

test('syncFile writes when disk is missing', async () => {
  const mockFs: FileSystem = {
    readFile: createReadFile('disk-content'),
    writeFile: vi.fn(async () => undefined),
    readDir: vi.fn(async () => []),
    fileInfo: vi.fn(async () => undefined),
    rename: vi.fn(async () => undefined),
    deleteFile: vi.fn(async () => undefined),
    rmdir: vi.fn(async () => undefined),
    mkdir: vi.fn(async () => undefined),
    isDirExist: vi.fn(async () => true),
    isFileExist: vi.fn(async () => false),
    utimeSync: vi.fn(async () => undefined),
  };

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => mockFs,
    type: 'web',
    initialVault: '/',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useFileSystemStore();
  const mutationListener = vi.fn();
  const stopListening = onFileMutation(mutationListener);

  const result = await store.syncFile('test.txt', 'store-content', 100);
  stopListening();

  expect(result).toBeUndefined();
  expect(mockFs.writeFile).toHaveBeenCalledWith('/test.txt', 'store-content', 'utf8');
  expect(mutationListener).not.toHaveBeenCalled();
});

test('syncFile does nothing when disk mtime equals time', async () => {
  const mockFs: FileSystem = {
    readFile: createReadFile('disk-content'),
    writeFile: vi.fn(async () => undefined),
    readDir: vi.fn(async () => []),
    fileInfo: vi.fn(async (path: string) => createDiskFile(path, 100)),
    rename: vi.fn(async () => undefined),
    deleteFile: vi.fn(async () => undefined),
    rmdir: vi.fn(async () => undefined),
    mkdir: vi.fn(async () => undefined),
    isDirExist: vi.fn(async () => true),
    isFileExist: vi.fn(async () => true),
    utimeSync: vi.fn(async () => undefined),
  };
  const readFileSpy = vi.spyOn(mockFs, 'readFile');

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => mockFs,
    type: 'web',
    initialVault: '/',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useFileSystemStore();

  const result = await store.syncFile('test.txt', 'store-content', 100);

  expect(result).toBeUndefined();
  expect(readFileSpy).not.toHaveBeenCalled();
  expect(mockFs.writeFile).not.toHaveBeenCalled();
});
