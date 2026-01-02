import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBufferStore } from './buffer';
import type { FileMeta } from 'orgnote-api';

const mockFiles: Map<string, FileMeta> = new Map();
const mockFileContents: Map<string, Uint8Array> = new Map();
let mockEncryptionType = 'disabled';

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useFileSystemManager: vi.fn(() => ({
        currentFs: {
          readFile: vi.fn(async (path: string) => mockFileContents.get(path)),
          writeFile: vi.fn(async (path: string, content: Uint8Array) => {
            mockFileContents.set(path, content);
          }),
        },
      })),
      useEncryption: vi.fn(() => ({
        encrypt: vi.fn(async (text: string) => `encrypted:${text}`),
        decrypt: vi.fn(async (text: string) => text.replace('encrypted:', '')),
      })),
      useConfig: vi.fn(() => ({
        config: {
          encryption: { get type() { return mockEncryptionType; } },
          editor: {
            saveDelayMs: 100,
            validationDelayMs: 100,
          },
        },
      })),
    },
    infrastructure: {
      fileRepository: {
        getByPath: vi.fn(async (path: string[]) => {
          const key = path.join('/');
          return mockFiles.get(key);
        }),
        save: vi.fn(async (file: FileMeta) => {
          mockFiles.set(file.filePath.join('/'), file);
        }),
      },
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: vi.fn(),
    reportWarning: vi.fn(),
  },
}));

vi.mock('./file-guard', () => ({
  useFileGuardStore: vi.fn(() => ({
    isReadOnly: vi.fn(() => false),
    getGuard: vi.fn(() => null),
    getReadOnlyReason: vi.fn(() => undefined),
    validate: vi.fn(async () => []),
  })),
}));

const mockWatchers: Map<string, (change: { type: string; path: string }) => void> = new Map();

vi.mock('./file-watcher', () => ({
  useFileWatcherStore: vi.fn(() => ({
    watch: vi.fn((path: string, callback: (change: { type: string; path: string }) => void) => {
      mockWatchers.set(path, callback);
      return () => mockWatchers.delete(path);
    }),
  })),
}));

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

beforeEach(() => {
  setActivePinia(createPinia());
  mockFiles.clear();
  mockFileContents.clear();
  mockWatchers.clear();
  mockEncryptionType = 'disabled';
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

test('getOrCreateBuffer creates new buffer for new path', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/test.org', textEncoder.encode('Test content'));

  const buffer = await store.getOrCreateBuffer('/notes/test.org');

  expect(buffer).toBeDefined();
  expect(buffer.path).toBe('/notes/test.org');
  expect(buffer.text).toBe('Test content');
});

test('getOrCreateBuffer returns existing buffer for same path', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/test.org', textEncoder.encode('Content'));

  const buffer1 = await store.getOrCreateBuffer('/notes/test.org');
  const buffer2 = await store.getOrCreateBuffer('/notes/test.org');

  expect(buffer1).toBe(buffer2);
});

test('getOrCreateBuffer increments referenceCount on second call', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/test.org', textEncoder.encode('Content'));

  const buffer = await store.getOrCreateBuffer('/notes/test.org');
  expect(buffer.referenceCount).toBe(1);

  await store.getOrCreateBuffer('/notes/test.org');
  expect(buffer.referenceCount).toBe(2);
});

test('getOrCreateBuffer loads content from filesystem', async () => {
  const store = useBufferStore();
  const content = 'Loaded from disk';
  mockFileContents.set('/notes/loaded.org', textEncoder.encode(content));

  const buffer = await store.getOrCreateBuffer('/notes/loaded.org');

  expect(buffer.text).toBe(content);
});

test('getOrCreateBuffer sets isLoading during load', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/loading.org', textEncoder.encode('Content'));

  const bufferPromise = store.getOrCreateBuffer('/notes/loading.org');
  const buffer = await bufferPromise;

  expect(buffer.isLoading).toBe(false);
});

test('getOrCreateBuffer extracts title from path', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/my-note.org', textEncoder.encode(''));

  const buffer = await store.getOrCreateBuffer('/notes/my-note.org');

  expect(buffer.title).toBe('my-note.org');
});

test('getOrCreateBuffer updates touchedAt for org files', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/touch.org', textEncoder.encode(''));
  mockFiles.set('notes/touch.org', {
    id: 'touch-id',
    filePath: ['notes', 'touch.org'],
    title: 'Touch',
  });

  await store.getOrCreateBuffer('/notes/touch.org');

  await vi.runAllTimersAsync();

  const savedFile = mockFiles.get('notes/touch.org');
  expect(savedFile?.touchedAt).toBeDefined();
});

test('getOrCreateBuffer handles missing file gracefully', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/empty.org', new Uint8Array(0));

  const buffer = await store.getOrCreateBuffer('/notes/empty.org');

  expect(buffer).toBeDefined();
  expect(buffer.text).toBe('');
});

test('releaseBuffer decrements referenceCount', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/release.org', textEncoder.encode(''));

  const buffer = await store.getOrCreateBuffer('/notes/release.org');
  await store.getOrCreateBuffer('/notes/release.org');
  expect(buffer.referenceCount).toBe(2);

  store.releaseBuffer('/notes/release.org');
  expect(buffer.referenceCount).toBe(1);
});

test('releaseBuffer does not go below zero', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/zero.org', textEncoder.encode(''));

  const buffer = await store.getOrCreateBuffer('/notes/zero.org');

  store.releaseBuffer('/notes/zero.org');
  store.releaseBuffer('/notes/zero.org');
  store.releaseBuffer('/notes/zero.org');

  expect(buffer.referenceCount).toBe(0);
});

test('releaseBuffer does nothing for non-existent path', () => {
  const store = useBufferStore();
  expect(() => store.releaseBuffer('/nonexistent')).not.toThrow();
});

test('closeBuffer returns true for clean buffer', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/clean.org', textEncoder.encode('Content'));

  await store.getOrCreateBuffer('/notes/clean.org');

  const result = await store.closeBuffer('/notes/clean.org');
  expect(result).toBe(true);
});

test('closeBuffer removes buffer from store', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/remove.org', textEncoder.encode(''));

  await store.getOrCreateBuffer('/notes/remove.org');
  await store.closeBuffer('/notes/remove.org');

  expect(store.getBufferByPath('/notes/remove.org')).toBeUndefined();
});

test('closeBuffer returns false for dirty buffer without force', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/dirty.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/dirty.org');
  buffer.setText('Modified content');

  const result = await store.closeBuffer('/notes/dirty.org');
  expect(result).toBe(false);
});

test('closeBuffer with force closes dirty buffer', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/force.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/force.org');
  buffer.setText('Modified content');

  const result = await store.closeBuffer('/notes/force.org', true);
  expect(result).toBe(true);
  expect(store.getBufferByPath('/notes/force.org')).toBeUndefined();
});

test('closeBuffer returns true for non-existent path', async () => {
  const store = useBufferStore();
  const result = await store.closeBuffer('/nonexistent');
  expect(result).toBe(true);
});

test('getBufferByPath returns buffer for existing path', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/get.org', textEncoder.encode(''));

  const created = await store.getOrCreateBuffer('/notes/get.org');
  const retrieved = store.getBufferByPath('/notes/get.org');

  expect(retrieved).toBe(created);
});

test('getBufferByPath returns undefined for non-existent path', () => {
  const store = useBufferStore();
  const result = store.getBufferByPath('/nonexistent');
  expect(result).toBeUndefined();
});

test('saveAllBuffers saves all dirty buffers', async () => {
  const store = useBufferStore();

  mockFileContents.set('/notes/save1.org', textEncoder.encode('Original 1'));
  mockFileContents.set('/notes/save2.org', textEncoder.encode('Original 2'));

  const buffer1 = await store.getOrCreateBuffer('/notes/save1.org');
  const buffer2 = await store.getOrCreateBuffer('/notes/save2.org');

  buffer1.setText('Modified 1');
  buffer2.setText('Modified 2');

  await store.saveAllBuffers();

  expect(textDecoder.decode(mockFileContents.get('/notes/save1.org'))).toBe('Modified 1');
  expect(textDecoder.decode(mockFileContents.get('/notes/save2.org'))).toBe('Modified 2');
});

test('saveAllBuffers does nothing for clean buffers', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/clean.org', textEncoder.encode('Content'));

  await store.getOrCreateBuffer('/notes/clean.org');

  const originalContent = mockFileContents.get('/notes/clean.org');
  await store.saveAllBuffers();

  expect(mockFileContents.get('/notes/clean.org')).toEqual(originalContent);
});

test('cleanup closes buffers with zero referenceCount', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/unused.org', textEncoder.encode(''));

  const buffer = await store.getOrCreateBuffer('/notes/unused.org');
  store.releaseBuffer('/notes/unused.org');
  expect(buffer.referenceCount).toBe(0);

  store.cleanup();
  await vi.runAllTimersAsync();

  expect(store.getBufferByPath('/notes/unused.org')).toBeUndefined();
});

test('cleanup keeps buffers with positive referenceCount', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/active.org', textEncoder.encode(''));

  await store.getOrCreateBuffer('/notes/active.org');

  store.cleanup();
  await vi.runAllTimersAsync();

  expect(store.getBufferByPath('/notes/active.org')).toBeDefined();
});

test('allBuffers returns all open buffers', async () => {
  const store = useBufferStore();

  mockFileContents.set('/notes/a.org', textEncoder.encode(''));
  mockFileContents.set('/notes/b.org', textEncoder.encode(''));
  mockFileContents.set('/notes/c.org', textEncoder.encode(''));

  await store.getOrCreateBuffer('/notes/a.org');
  await store.getOrCreateBuffer('/notes/b.org');
  await store.getOrCreateBuffer('/notes/c.org');

  expect(store.allBuffers).toHaveLength(3);
});

test('buffer text getter returns decoded content', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/text.org', textEncoder.encode('Hello World'));

  const buffer = await store.getOrCreateBuffer('/notes/text.org');

  expect(buffer.text).toBe('Hello World');
});

test('buffer setText updates rawContent', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/set.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/set.org');
  buffer.setText('New Content');

  expect(buffer.text).toBe('New Content');
});

test('buffer base64 getter returns encoded content', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/base64.org', textEncoder.encode('Test'));

  const buffer = await store.getOrCreateBuffer('/notes/base64.org');

  expect(buffer.base64).toBeDefined();
  expect(typeof buffer.base64).toBe('string');
});

test('auto-save triggers on content change after delay', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/auto.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/auto.org');
  buffer.setText('Modified');

  vi.advanceTimersByTime(100);
  await vi.runAllTimersAsync();

  expect(textDecoder.decode(mockFileContents.get('/notes/auto.org'))).toBe('Modified');
});

test('buffer isSaving flag is set during save', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/saving.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/saving.org');
  buffer.setText('Modified');

  expect(buffer.isSaving).toBe(false);
});

test('external file change reloads clean buffer', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/external.org', textEncoder.encode('Original'));

  await store.getOrCreateBuffer('/notes/external.org');

  mockFileContents.set('/notes/external.org', textEncoder.encode('External change'));

  const watcher = mockWatchers.get('/notes/external.org');
  if (watcher) {
    watcher({ type: 'modify', path: '/notes/external.org' });
  }

  await vi.runAllTimersAsync();
});

test('external file change ignored for dirty buffer', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/dirty-ext.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/dirty-ext.org');
  buffer.setText('Local changes');

  mockFileContents.set('/notes/dirty-ext.org', textEncoder.encode('External'));

  const watcher = mockWatchers.get('/notes/dirty-ext.org');
  if (watcher) {
    watcher({ type: 'modify', path: '/notes/dirty-ext.org' });
  }

  await vi.runAllTimersAsync();

  expect(buffer.text).toBe('Local changes');
});

test('external file delete adds error to buffer', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/delete-ext.org', textEncoder.encode('Content'));

  const buffer = await store.getOrCreateBuffer('/notes/delete-ext.org');
  const initialErrors = buffer.errors.length;

  const watcher = mockWatchers.get('/notes/delete-ext.org');
  if (watcher) {
    watcher({ type: 'delete', path: '/notes/delete-ext.org' });
  }

  await vi.runAllTimersAsync();

  expect(buffer.errors.length).toBeGreaterThan(initialErrors);
});

test('external change ignored during save', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/during-save.org', textEncoder.encode('Original'));

  const buffer = await store.getOrCreateBuffer('/notes/during-save.org');
  buffer.setText('Modified');

  buffer.isSaving = true;

  const watcher = mockWatchers.get('/notes/during-save.org');
  if (watcher) {
    watcher({ type: 'modify', path: '/notes/during-save.org' });
  }

  await vi.runAllTimersAsync();

  expect(buffer.text).toBe('Modified');
});

test('encrypted file requires encryption config', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/secret.org.gpg', textEncoder.encode('encrypted:Secret'));

  const buffer = await store.getOrCreateBuffer('/notes/secret.org.gpg');

  expect(buffer.errors.length).toBeGreaterThan(0);
});

test('encrypted file decrypts with valid config', async () => {
  mockEncryptionType = 'gpg';
  const store = useBufferStore();
  mockFileContents.set('/notes/valid-secret.org.gpg', textEncoder.encode('encrypted:Decrypted'));

  const buffer = await store.getOrCreateBuffer('/notes/valid-secret.org.gpg');

  expect(buffer.text).toBe('Decrypted');
});

test('closeBuffer stops file watcher', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/watch-stop.org', textEncoder.encode(''));

  await store.getOrCreateBuffer('/notes/watch-stop.org');
  expect(mockWatchers.has('/notes/watch-stop.org')).toBe(true);

  await store.closeBuffer('/notes/watch-stop.org');
  expect(mockWatchers.has('/notes/watch-stop.org')).toBe(false);
});

test('buffer lastAccessed updated on access', async () => {
  const store = useBufferStore();
  mockFileContents.set('/notes/access.org', textEncoder.encode(''));

  const buffer = await store.getOrCreateBuffer('/notes/access.org');
  const firstAccess = buffer.lastAccessed;

  vi.advanceTimersByTime(1000);

  await store.getOrCreateBuffer('/notes/access.org');
  expect(buffer.lastAccessed.getTime()).toBeGreaterThan(firstAccess.getTime());
});
