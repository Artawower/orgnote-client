import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFileSearchStore } from './file-search';
import type { FileMeta, DiskFile } from 'orgnote-api';

const mockFiles: Map<string, FileMeta> = new Map();
const mockKeyValue: Map<string, string> = new Map();

vi.mock('src/boot/repositories', () => ({
  repositories: {
    fileRepository: {
      save: vi.fn(async (meta: FileMeta) => {
        mockFiles.set(meta.id, meta);
      }),
      getByPath: vi.fn(async (path: string[]) => {
        for (const file of mockFiles.values()) {
          if (file.filePath.join('/') === path.join('/')) return file;
        }
        return undefined;
      }),
      getByIds: vi.fn(async (ids: string[]) => {
        return ids.map((id) => mockFiles.get(id)).filter(Boolean) as FileMeta[];
      }),
      delete: vi.fn(async (id: string) => {
        mockFiles.delete(id);
      }),
    },
    keyValueRepository: {
      get: vi.fn(async (key: string) => mockKeyValue.get(key)),
      set: vi.fn(async (key: string, value: string) => {
        mockKeyValue.set(key, value);
      }),
      delete: vi.fn(async (key: string) => {
        mockKeyValue.delete(key);
      }),
    },
  },
}));

const mockFileContents: Map<string, string> = new Map();
const mockFileInfos: Map<string, { mtime: string }> = new Map();
const mockDirEntries: Map<string, DiskFile[]> = new Map();

vi.mock('src/stores/file-system', () => ({
  useFileSystemStore: vi.fn(() => ({
    readFile: vi.fn(async (path: string) => mockFileContents.get(path)),
    fileInfo: vi.fn(async (path: string) => mockFileInfos.get(path)),
    readDir: vi.fn(async (path: string) => mockDirEntries.get(path) ?? []),
  })),
}));

vi.mock('src/stores/encryption', () => ({
  useEncryptionStore: vi.fn(() => ({
    decrypt: vi.fn(async (data: Uint8Array) => new TextDecoder().decode(data)),
  })),
}));

const mockQueueTasks: Array<{ queueId: string; payload: unknown }> = [];

vi.mock('src/stores/queue', () => ({
  useQueueStore: vi.fn(() => ({
    add: vi.fn(async (queueId: string, payload: unknown) => {
      mockQueueTasks.push({ queueId, payload });
      return 'task-id';
    }),
  })),
}));

vi.mock('org-mode-ast', () => ({
  parse: vi.fn(() => ({ type: 'root', children: [] })),
  withMetaInfo: vi.fn((node) => ({
    ...node,
    meta: {
      id: 'parsed-id',
      title: 'Parsed Title',
      description: 'Parsed description',
      fileTags: ['tag1', 'tag2'],
      connectedNotes: { link1: true, link2: true },
    },
  })),
}));

beforeEach(() => {
  setActivePinia(createPinia());
  mockFiles.clear();
  mockKeyValue.clear();
  mockFileContents.clear();
  mockFileInfos.clear();
  mockDirEntries.clear();
  mockQueueTasks.length = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

test('search returns empty array for empty query', async () => {
  const store = useFileSearchStore();
  const result = await store.search('');
  expect(result).toEqual([]);
});

test('search returns empty array for whitespace-only query', async () => {
  const store = useFileSearchStore();
  const result = await store.search('   ');
  expect(result).toEqual([]);
});

test('search clears lastSearchResult for empty query', async () => {
  const store = useFileSearchStore();
  store.lastSearchResult = {
    files: [],
    total: 5,
    query: 'previous',
    searchedAt: Date.now(),
  };

  await store.search('');
  expect(store.lastSearchResult).toBeNull();
});

test('search sets isSearching during search', async () => {
  const store = useFileSearchStore();

  mockFiles.set('test-id', {
    id: 'test-id',
    filePath: ['test.org'],
    title: 'Test',
  });

  store.processFile('/test.org');

  const searchPromise = store.search('Test');
  expect(store.isSearching).toBe(true);

  await searchPromise;
  expect(store.isSearching).toBe(false);
});

test('search with limit option after processFile', async () => {
  const store = useFileSearchStore();

  for (let i = 0; i < 10; i++) {
    mockFileContents.set(`/note${i}.org`, `#+TITLE: Meeting ${i}\nContent ${i}`);
    await store.processFile(`/note${i}.org`);
  }

  const result = await store.search('Meeting', { limit: 5 });
  expect(result.length).toBeLessThanOrEqual(5);
});

test('search updates lastSearchResult after processFile', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/result.org', '#+TITLE: Search Result\nContent');
  await store.processFile('/result.org');

  await store.search('Result');

  expect(store.lastSearchResult).not.toBeNull();
  expect(store.lastSearchResult?.query).toBe('Result');
  expect(store.lastSearchResult?.searchedAt).toBeDefined();
});

test('indexFile adds task to queue', async () => {
  const store = useFileSearchStore();
  await store.indexFile('/notes/test.org');

  expect(mockQueueTasks).toHaveLength(1);
  expect(mockQueueTasks[0]!.queueId).toBe('content-index');
  expect((mockQueueTasks[0]!.payload as { filePath: string }).filePath).toBe('/notes/test.org');
});

test('processFile parses and saves file metadata', async () => {
  const store = useFileSearchStore();
  mockFileContents.set('/notes/test.org', '#+TITLE: Test\nContent here');

  await store.processFile('/notes/test.org');

  expect(mockFiles.size).toBe(1);
  const saved = Array.from(mockFiles.values())[0]!;
  expect(saved.title).toBe('Parsed Title');
  expect(saved.tags).toEqual(['tag1', 'tag2']);
});

test('processFile does nothing for empty file', async () => {
  const store = useFileSearchStore();
  mockFileContents.set('/notes/empty.org', '');

  await store.processFile('/notes/empty.org');
  expect(mockFiles.size).toBe(0);
});

test('processFile does nothing for missing file', async () => {
  const store = useFileSearchStore();

  await store.processFile('/notes/nonexistent.org');
  expect(mockFiles.size).toBe(0);
});

test('removeFile by id removes from repository', async () => {
  const store = useFileSearchStore();
  const file: FileMeta = { id: 'to-remove', filePath: ['remove.org'], title: 'Remove' };
  mockFiles.set(file.id, file);

  await store.removeFile({ id: 'to-remove' });

  expect(mockFiles.has('to-remove')).toBe(false);
});

test('removeFile by path removes from repository', async () => {
  const store = useFileSearchStore();
  const file: FileMeta = { id: 'path-remove', filePath: ['folder', 'remove.org'], title: 'Remove' };
  mockFiles.set(file.id, file);

  await store.removeFile({ path: ['folder', 'remove.org'] });

  expect(mockFiles.has('path-remove')).toBe(false);
});

test('removeFile does nothing for non-existent id', async () => {
  const store = useFileSearchStore();
  await expect(store.removeFile({ id: 'non-existent' })).resolves.not.toThrow();
});

test('indexFiles sets isIndexing flag', async () => {
  const store = useFileSearchStore();
  mockDirEntries.set('/', []);

  const promise = store.indexFiles();
  expect(store.isIndexing).toBe(true);

  await promise;
  expect(store.isIndexing).toBe(false);
});

test('indexFiles scans directories recursively', async () => {
  const store = useFileSearchStore();

  mockDirEntries.set('/', [{ name: 'subdir', type: 'directory', path: '/subdir', size: 0, mtime: 0 }]);
  mockDirEntries.set('/subdir', [{ name: 'note.org', type: 'file', path: '/subdir/note.org', size: 0, mtime: 0 }]);
  mockFileInfos.set('/subdir/note.org', { mtime: new Date().toISOString() });

  await store.indexFiles();

  expect(
    mockQueueTasks.some((t) => (t.payload as { filePath: string }).filePath === '/subdir/note.org'),
  ).toBe(true);
});

test('indexFiles skips non-org files', async () => {
  const store = useFileSearchStore();

  mockDirEntries.set('/', [
    { name: 'note.org', type: 'file', path: '/note.org', size: 0, mtime: 0 },
    { name: 'readme.txt', type: 'file', path: '/readme.txt', size: 0, mtime: 0 },
    { name: 'data.json', type: 'file', path: '/data.json', size: 0, mtime: 0 },
  ]);
  mockFileInfos.set('/note.org', { mtime: new Date().toISOString() });
  mockFileInfos.set('/readme.txt', { mtime: new Date().toISOString() });
  mockFileInfos.set('/data.json', { mtime: new Date().toISOString() });

  await store.indexFiles();

  expect(mockQueueTasks).toHaveLength(1);
  expect((mockQueueTasks[0]!.payload as { filePath: string }).filePath).toBe('/note.org');
});

test('indexFiles indexes files not in repository', async () => {
  const store = useFileSearchStore();

  mockDirEntries.set('/', [{ name: 'new.org', type: 'file', path: '/new.org', size: 0, mtime: 0 }]);
  mockFileInfos.set('/new.org', { mtime: new Date().toISOString() });

  await store.indexFiles();

  expect(mockQueueTasks.some((t) => (t.payload as { filePath: string }).filePath === '/new.org')).toBe(true);
});

test('indexFiles indexes files not in indexedIds', async () => {
  const store = useFileSearchStore();

  const existingFile: FileMeta = {
    id: 'existing-id',
    filePath: ['existing.org'],
    title: 'Existing',
  };
  mockFiles.set(existingFile.id, existingFile);

  mockKeyValue.set(
    'file-index',
    JSON.stringify({
      version: 3,
      files: {
        'existing-id': {
          id: 'existing-id',
          indexedAt: '2020-01-01T00:00:00.000Z',
          fileModifiedAt: '2020-01-01T00:00:00.000Z',
        },
      },
    }),
  );

  await store.loadIndex();

  mockDirEntries.set('/', [{ name: 'existing.org', type: 'file', path: '/existing.org', size: 0, mtime: 0 }]);
  mockFileInfos.set('/existing.org', { mtime: new Date().toISOString() });

  await store.indexFiles();

  expect(
    mockQueueTasks.some((t) => (t.payload as { filePath: string }).filePath === '/existing.org'),
  ).toBe(true);
});

test('indexFiles skips files with old mtime when already in repo', async () => {
  const store = useFileSearchStore();

  const existingFile: FileMeta = {
    id: 'parsed-id',
    filePath: ['indexed.org'],
    title: 'Indexed',
  };
  mockFiles.set(existingFile.id, existingFile);

  mockKeyValue.set(
    'file-index',
    JSON.stringify({
      version: 3,
      files: {
        'parsed-id': {
          id: 'parsed-id',
          indexedAt: '2020-01-01T00:00:00.000Z',
          fileModifiedAt: '2020-01-01T00:00:00.000Z',
        },
      },
    }),
  );

  mockFileContents.set('/indexed.org', '#+TITLE: Indexed\nContent');
  mockFileInfos.set('/indexed.org', { mtime: '2020-01-01T00:00:00.000Z' });
  await store.loadIndex();
  mockQueueTasks.length = 0;

  mockDirEntries.set('/', [{ name: 'indexed.org', type: 'file', path: '/indexed.org', size: 0, mtime: 0 }]);
  mockFileInfos.set('/indexed.org', { mtime: '2019-01-01T00:00:00.000Z' });

  await store.indexFiles();

  expect(mockQueueTasks).toHaveLength(0);
});

test('indexFiles indexes modified files since lastIndexedAt', async () => {
  const store = useFileSearchStore();

  const existingFile: FileMeta = {
    id: 'modified-id',
    filePath: ['modified.org'],
    title: 'Modified',
  };
  mockFiles.set(existingFile.id, existingFile);

  mockKeyValue.set(
    'file-index',
    JSON.stringify({
      version: 3,
      files: {
        'modified-id': {
          id: 'modified-id',
          indexedAt: '2020-01-01T00:00:00.000Z',
          fileModifiedAt: '2020-01-01T00:00:00.000Z',
        },
      },
    }),
  );

  await store.loadIndex();
  mockQueueTasks.length = 0;

  mockDirEntries.set('/', [{ name: 'modified.org', type: 'file', path: '/modified.org', size: 0, mtime: 0 }]);
  mockFileInfos.set('/modified.org', { mtime: new Date().toISOString() });

  await store.indexFiles();

  expect(
    mockQueueTasks.some((t) => (t.payload as { filePath: string }).filePath === '/modified.org'),
  ).toBe(true);
});

test('loadIndex returns false when no stored index', async () => {
  const store = useFileSearchStore();
  const result = await store.loadIndex();
  expect(result).toBe(false);
});

test('loadIndex returns false for wrong version', async () => {
  const store = useFileSearchStore();
  mockKeyValue.set('file-index', JSON.stringify({ version: 999, files: { id1: { id: 'id1', indexedAt: '2020-01-01T00:00:00.000Z', fileModifiedAt: '2020-01-01T00:00:00.000Z' } } }));

  const result = await store.loadIndex();
  expect(result).toBe(false);
});

test('loadIndex returns false for corrupted JSON', async () => {
  const store = useFileSearchStore();
  mockKeyValue.set('file-index', 'not valid json');

  const result = await store.loadIndex();
  expect(result).toBe(false);
});

test('loadIndex returns false for empty indexed files', async () => {
  const store = useFileSearchStore();
  mockKeyValue.set('file-index', JSON.stringify({ version: 3, files: {} }));

  const result = await store.loadIndex();
  expect(result).toBe(false);
});

test('loadIndex restores index from storage', async () => {
  const store = useFileSearchStore();

  const file: FileMeta = { id: 'stored-id', filePath: ['stored.org'], title: 'Stored' };
  mockFiles.set(file.id, file);
  mockFileContents.set('/stored.org', 'Stored content');

  mockKeyValue.set(
    'file-index',
    JSON.stringify({ version: 3, files: { 'stored-id': { id: 'stored-id', indexedAt: '2020-01-01T00:00:00.000Z', fileModifiedAt: '2020-01-01T00:00:00.000Z' } } }),
  );

  const result = await store.loadIndex();

  expect(result).toBe(true);
  expect(store.indexStats.indexed).toBe(1);
});

test('loadIndex skips files missing from repository', async () => {
  const store = useFileSearchStore();
  mockKeyValue.set(
    'file-index',
    JSON.stringify({ version: 3, files: { 'missing-id': { id: 'missing-id', indexedAt: '2020-01-01T00:00:00.000Z', fileModifiedAt: '2020-01-01T00:00:00.000Z' } } }),
  );

  const result = await store.loadIndex();
  expect(result).toBe(false);
});

test('saveIndex stores version and indexed files', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/save.org', '#+TITLE: Save\nContent');
  mockFileInfos.set('/save.org', { mtime: new Date().toISOString() });
  await store.processFile('/save.org');

  await store.saveIndex();

  const stored = mockKeyValue.get('file-index');
  expect(stored).toBeDefined();

  const parsed = JSON.parse(stored!);
  expect(parsed.version).toBe(3);
  expect(Object.keys(parsed.files).length).toBeGreaterThan(0);
  expect(parsed.files['parsed-id']).toBeDefined();
});

test('clearIndex removes all indexed data', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/clear.org', '#+TITLE: Clear\nContent');
  await store.processFile('/clear.org');
  mockKeyValue.set('file-index', 'some data');

  await store.clearIndex();

  expect(store.indexStats.indexed).toBe(0);
  expect(mockKeyValue.has('file-index')).toBe(false);
});

test('processFile saves file metadata to repository', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/save-test.org', '#+TITLE: Save Test\nContent');

  await store.processFile('/save-test.org');

  expect(mockFiles.size).toBe(1);
  const saved = Array.from(mockFiles.values())[0]!;
  expect(saved.title).toBe('Parsed Title');
});

test('processFile extracts links from parsed content', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/links.org', '#+TITLE: Links\n[[id:link1][Link 1]]');

  await store.processFile('/links.org');

  const saved = Array.from(mockFiles.values())[0]!;
  expect(saved.links).toContain('link1');
});

test('removeFile removes from repository', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/to-remove.org', '#+TITLE: Remove\nContent');
  await store.processFile('/to-remove.org');
  expect(mockFiles.size).toBe(1);

  const savedFile = Array.from(mockFiles.values())[0]!;
  await store.removeFile({ id: savedFile.id });

  expect(mockFiles.has(savedFile.id)).toBe(false);
});

test('removeFile by path resolves file and removes', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/by-path.org', '#+TITLE: By Path\nContent');
  await store.processFile('/by-path.org');

  await store.removeFile({ path: ['by-path.org'] });
});

test('search returns files from repository after processFile', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/searchable.org', '#+TITLE: Searchable Meeting\nContent');
  await store.processFile('/searchable.org');

  const savedFile = Array.from(mockFiles.values())[0]!;
  expect(savedFile).toBeDefined();
  expect(savedFile.title).toBe('Parsed Title');
});

test('processFile handles file with all metadata', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/full.org', '#+TITLE: Full\n#+DESCRIPTION: Desc\nContent');
  await store.processFile('/full.org');

  const saved = Array.from(mockFiles.values())[0]!;
  expect(saved.description).toBe('Parsed description');
  expect(saved.tags).toEqual(['tag1', 'tag2']);
});

test('processFile sets updatedAt timestamp', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/timestamp.org', '#+TITLE: Timestamp\nContent');
  await store.processFile('/timestamp.org');

  const saved = Array.from(mockFiles.values())[0]!;
  expect(saved.updatedAt).toBeDefined();
});

test('processFile creates correct filePath array', async () => {
  const store = useFileSearchStore();

  mockFileContents.set('/folder/subfolder/note.org', '#+TITLE: Nested\nContent');
  await store.processFile('/folder/subfolder/note.org');

  const saved = Array.from(mockFiles.values())[0]!;
  expect(saved.filePath).toEqual(['folder', 'subfolder', 'note.org']);
});
