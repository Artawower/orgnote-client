import { createPinia, setActivePinia } from 'pinia';
import { useFileSystemManagerStore } from './file-system-manager';
import { expect, test, vi, beforeEach } from 'vitest';
import type { FileSystemInfo } from 'orgnote-api';

const mockFileSystemInstance = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readDir: vi.fn(),
  fileInfo: vi.fn(),
  rename: vi.fn(),
  deleteFile: vi.fn(),
  rmdir: vi.fn(),
  mkdir: vi.fn(),
  isDirExist: vi.fn(),
  isFileExist: vi.fn(),
  utimeSync: vi.fn(),
};

const mockFileSystemInfo: FileSystemInfo = {
  name: 'mockFs',
  fs: () => mockFileSystemInstance, // Always return the same instance
  type: 'desktop',
};

beforeEach(() => {
  const pinia = createPinia();
  setActivePinia(pinia);
});

test('initial state of the store is correct', () => {
  const store = useFileSystemManagerStore();
  expect(store.currentFsName).toBe('');
  expect(store.fileSystems).toEqual([]);
  expect(store.currentFs).toBeUndefined();
});

test('registering a new file system works correctly', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);

  expect(store.fileSystems).toContainEqual(mockFileSystemInfo);
});

test('setting currentFsName updates currentFs correctly', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'mockFs';

  expect(store.currentFsName).toBe('mockFs');
  expect(store.currentFs).toEqual(mockFileSystemInfo.fs());
});

test('computed properties are updated correctly after registration and setting currentFsName', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'mockFs';

  expect(store.fileSystems).toEqual([mockFileSystemInfo]);
  expect(store.currentFs).toEqual(mockFileSystemInfo.fs());
});

test('registering a file system with a duplicate name overwrites the existing one', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);

  const duplicateFileSystemInfo: FileSystemInfo = {
    name: 'mockFs',
    fs: () => ({
      readFile: vi.fn(),
      writeFile: vi.fn(),
      readDir: vi.fn(),
      fileInfo: vi.fn(),
      rename: vi.fn(),
      deleteFile: vi.fn(),
      rmdir: vi.fn(),
      mkdir: vi.fn(),
      isDirExist: vi.fn(),
      isFileExist: vi.fn(),
      utimeSync: vi.fn(),
    }),
    type: 'web',
  };

  store.register(duplicateFileSystemInfo);

  expect(store.fileSystems).toContainEqual(duplicateFileSystemInfo);
  expect(store.fileSystems).not.toContainEqual(mockFileSystemInfo);
});

test('setting currentFsName to a non-existent file system results in undefined currentFs', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'nonExistentFs';

  expect(store.currentFsName).toBe('nonExistentFs');
  expect(store.currentFs).toBeUndefined();
});

test('computed properties are correct when no file systems are registered', () => {
  const store = useFileSystemManagerStore();
  store.currentFsName = '';

  expect(store.fileSystems).toEqual([]);
  expect(store.currentFs).toBeUndefined();
});

test('registering a file system with invalid properties still adds it to the store', () => {
  const store = useFileSystemManagerStore();
  const invalidFileSystemInfo = {
    name: 'invalidFs',
    fs: {
      readFile: vi.fn(),
    },
  } as unknown as FileSystemInfo;

  store.register(invalidFileSystemInfo);

  expect(store.fileSystems).toContainEqual(invalidFileSystemInfo);
});

test('setting currentFsName to an empty string results in undefined currentFs', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'mockFs';
  store.currentFsName = '';

  expect(store.currentFsName).toBe('');
  expect(store.currentFs).toBeUndefined();
});
