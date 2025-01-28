// import { createPinia, setActivePinia } from 'pinia';
// import { useFileSystemStore } from 'src/stores/file-system';
// import { beforeEach, expect, test, vi } from 'vitest';
// import { Platform } from 'quasar';
// import { ErrorFileNotFound, type FileSystem } from 'orgnote-api';

// vi.mock('quasar', () => ({
//   Platform: {
//     is: {
//       nativeMobile: false,
//       android: false,
//       mobile: false,
//     },
//   },
// }));

// const mockSettingsStore = {
//   config: {
//     vault: {
//       path: '/mock/vault/path',
//     },
//     encryption: {
//       method: 'aes-256-cbc',
//       key: 'mock-key',
//       iv: 'mock-iv',
//     },
//   },
// };

// vi.mock('src/stores/settings', () => ({
//   useSettingsStore: () => mockSettingsStore,
// }));

// vi.mock('./encryption', () => ({
//   useEncryptionStore: () => ({
//     decrypt: vi.fn((content) => `decrypted-${content}`),
//     encrypt: vi.fn((content) => `encrypted-${content}`),
//   }),
// }));

// vi.mock('src/boot/api', () => ({
//   api: {},
// }));

// const mockFileSystem = {
//   readFile: vi.fn(),
//   writeFile: vi.fn(),
//   fileInfo: vi.fn(),
//   readDir: vi.fn(),
//   mkdir: vi.fn(),
//   rmdir: vi.fn(),
//   deleteFile: vi.fn(),
//   rename: vi.fn(),
//   isDirExist: vi.fn(),
//   isFileExist: vi.fn(),
//   utimeSync: vi.fn(),
// };

// setActivePinia(createPinia());

// beforeEach(() => {
//   vi.clearAllMocks();
//   Platform.is.mobile = false;
//   Platform.is.android = false;
//   Platform.is.nativeMobile = false;
//   mockSettingsStore.config.vault.path = '/mock/vault/path';
//   mockSettingsStore.config.encryption = {
//     method: 'aes-256-cbc',
//     key: 'mock-key',
//     iv: 'mock-iv',
//   };
// });

// test('readTextFile should read and decrypt gpg files', async () => {
//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   mockFileSystem.readFile.mockResolvedValue('test-content');

//   const content = await store.readTextFile('test.org');
//   expect(content).toBe('test-content');
//   expect(mockFileSystem.readFile).toHaveBeenCalled();
// });

// test('writeFile should write and encrypt gpg files', async () => {
//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await store.writeFile('test.org.gpg', 'test-content');
//   expect(mockFileSystem.writeFile).toHaveBeenCalled();
// });

// test('readDir should return empty array when no vault provided on mobile', async () => {
//   mockSettingsStore.config.vault.path = '';
//   Platform.is.mobile = true;
//   Platform.is.android = true;

//   const store = useFileSystemStore();

//   const result = await store.readDir();
//   expect(result).toEqual([]);
// });

// test('mkdir should create directory', async () => {
//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await store.mkdir('test-dir');
//   expect(mockFileSystem.mkdir).toHaveBeenCalled();
// });

// test('rmdir should remove directory', async () => {
//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await store.rmdir('test-dir');
//   expect(mockFileSystem.rmdir).toHaveBeenCalled();
// });

// test('fileInfo should return file information', async () => {
//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   mockFileSystem.fileInfo.mockResolvedValue({ path: 'test.org', mtime: 123 });

//   const info = await store.fileInfo('test.org');
//   expect(info.path).toBe('test.org');
//   expect(info.mtime).toBe(123);
// });

// test('deleteFile should remove file', async () => {
//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await store.deleteFile('test.org');
//   expect(mockFileSystem.deleteFile).toHaveBeenCalled();
// });

// test('readTextFile should throw ErrorFileNotFound when file does not exist', async () => {
//   mockFileSystem.readFile.mockRejectedValue(new ErrorFileNotFound('File not found'));

//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await expect(store.readTextFile('nonexistent.org.gpg')).rejects.toThrow(ErrorFileNotFound);
// });

// test('rename should throw error when newPath already exists', async () => {
//   mockFileSystem.rename.mockImplementation((oldPath, newPath) => {
//     if (newPath === '/mock/vault/path/existing.org.gpg') {
//       throw new Error('File already exists');
//     }
//     return Promise.resolve();
//   });

//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await expect(store.rename('old.org.gpg', 'existing.org.gpg')).rejects.toThrow(
//     'File already exists',
//   );
// });

// test('deleteFile should throw ErrorFileNotFound when file does not exist', async () => {
//   mockFileSystem.deleteFile.mockRejectedValue(new ErrorFileNotFound('File not found'));

//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await expect(store.deleteFile('nonexistent.org.gpg')).rejects.toThrow(ErrorFileNotFound);
// });

// test('mkdir should throw error when directory already exists', async () => {
//   mockFileSystem.mkdir.mockImplementation((path) => {
//     if (path === '/mock/vault/path/existing-dir') {
//       throw new Error('Directory already exists');
//     }
//     return Promise.resolve();
//   });

//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   await expect(store.mkdir('existing-dir')).rejects.toThrow('Directory already exists');
// });

// test('syncFile should not update file if existing file is newer', async () => {
//   mockFileSystem.fileInfo.mockResolvedValue({ path: '/mock/vault/path/test.org.gpg', mtime: 200 });
//   mockFileSystem.readFile.mockResolvedValue('test-content');

//   const store = useFileSystemStore();
//   await store.registerFileSystem('test-fs', mockFileSystem);
//   await store.pickFileSystem('test-fs');

//   const content = await store.syncFile('test.org.gpg', 'new-content', 100);
//   expect(content).toBe('decrypted-test-content');
//   expect(mockFileSystem.writeFile).not.toHaveBeenCalled();
// });

// // TODO: add fs validator.
// test.skip('registerFileSystem should throw error when fs is invalid', async () => {
//   const invalidFs = {};
//   const store = useFileSystemStore();
//   await expect(store.registerFileSystem('invalid-fs', invalidFs as FileSystem)).rejects.toThrow();
// });
