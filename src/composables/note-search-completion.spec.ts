import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNoteSearchCompletion } from './note-search-completion';
import type { OrgNoteApi, FileMeta, CompletionSearchResult, CompletionConfig } from 'orgnote-api';
import { ref } from 'vue';

const mockFiles: FileMeta[] = [];
let mockSearchResult: { files: FileMeta[]; total: number; query: string } | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedCompletionConfig: CompletionConfig<any> | null = null;

const createMockApi = (): OrgNoteApi => {
  const mockCompletion = {
    open: vi.fn(async (config) => {
      capturedCompletionConfig = config;
    }),
    close: vi.fn(),
  };

  const mockFileSearch = {
    search: vi.fn(async (query: string, options?: { limit?: number; offset?: number }) => {
      const filtered = mockFiles.filter(
        (f) =>
          f.title?.toLowerCase().includes(query.toLowerCase()) ||
          f.description?.toLowerCase().includes(query.toLowerCase()) ||
          f.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())),
      );
      mockSearchResult = {
        files: filtered.slice(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 20)),
        total: filtered.length,
        query,
      };
      return mockSearchResult.files;
    }),
    lastSearchResult: ref(mockSearchResult),
  };

  const mockFileMeta = {
    getAll: vi.fn(async (options?: { limit?: number; offset?: number }) => {
      return mockFiles.slice(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? 20));
    }),
    count: vi.fn(async () => mockFiles.length),
  };

  const mockFileReader = {
    openFile: vi.fn(),
  };

  return {
    core: {
      useCompletion: vi.fn(() => mockCompletion),
      useFileSearch: vi.fn(() => mockFileSearch),
      useFileMeta: vi.fn(() => mockFileMeta),
      useFileReader: vi.fn(() => mockFileReader),
    },
  } as unknown as OrgNoteApi;
};

beforeEach(() => {
  mockFiles.length = 0;
  mockSearchResult = null;
  capturedCompletionConfig = null;
});

afterEach(() => {
  vi.clearAllMocks();
});

test('useNoteSearchCompletion opens completion modal', async () => {
  const api = createMockApi();

  await useNoteSearchCompletion(api);

  expect(api.core.useCompletion().open).toHaveBeenCalled();
});

test('useNoteSearchCompletion opens with choice type', async () => {
  const api = createMockApi();

  await useNoteSearchCompletion(api);

  expect(capturedCompletionConfig?.type).toBe('choice');
});

test('useNoteSearchCompletion sets search placeholder', async () => {
  const api = createMockApi();

  await useNoteSearchCompletion(api);

  expect(capturedCompletionConfig?.placeholder).toBeDefined();
});

test('itemsGetter returns recent files for empty query', async () => {
  const api = createMockApi();

  mockFiles.push(
    { id: '1', filePath: ['recent1.org'], title: 'Recent 1' },
    { id: '2', filePath: ['recent2.org'], title: 'Recent 2' },
  );

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result).toHaveLength(2);
  expect(result.total).toBe(2);
});

test('itemsGetter searches files with non-empty query', async () => {
  const api = createMockApi();

  mockFiles.push(
    { id: '1', filePath: ['meeting.org'], title: 'Meeting Notes' },
    { id: '2', filePath: ['todo.org'], title: 'Todo List' },
  );

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('Meeting', 20, 0)) as CompletionSearchResult;

  expect(result.result).toHaveLength(1);
  expect(result.result[0]!.title).toBe('Meeting Notes');
});

test('itemsGetter respects limit parameter', async () => {
  const api = createMockApi();

  for (let i = 0; i < 10; i++) {
    mockFiles.push({ id: `${i}`, filePath: [`note${i}.org`], title: `Note ${i}` });
  }

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 5, 0)) as CompletionSearchResult;

  expect(result.result).toHaveLength(5);
});

test('itemsGetter respects offset parameter', async () => {
  const api = createMockApi();

  for (let i = 0; i < 10; i++) {
    mockFiles.push({ id: `${i}`, filePath: [`note${i}.org`], title: `Note ${i}` });
  }

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 5, 3)) as CompletionSearchResult;

  expect(result.result).toHaveLength(5);
  expect((result.result[0]!.data as FileMeta)?.id).toBe('3');
});

test('candidate has correct icon', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['test.org'], title: 'Test' });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.icon).toBe('sym_o_description');
});

test('candidate uses title from file', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['test.org'], title: 'My Title' });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.title).toBe('My Title');
});

test('candidate uses filename when no title', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['folder', 'untitled.org'], title: undefined });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.title).toBe('untitled.org');
});

test('candidate description includes file description', async () => {
  const api = createMockApi();

  mockFiles.push({
    id: '1',
    filePath: ['test.org'],
    title: 'Test',
    description: 'This is a description',
  });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.description).toContain('This is a description');
});

test('candidate description includes tags', async () => {
  const api = createMockApi();

  mockFiles.push({
    id: '1',
    filePath: ['test.org'],
    title: 'Test',
    tags: ['work', 'important'],
  });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.description).toContain('#work');
  expect(result.result[0]!.description).toContain('#important');
});

test('candidate commandHandler opens file', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['folder', 'test.org'], title: 'Test' });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;
  result.result[0]!.commandHandler(api);

  expect(api.core.useFileReader().openFile).toHaveBeenCalledWith('/folder/test.org');
});

test('candidate commandHandler closes completion', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['test.org'], title: 'Test' });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;
  result.result[0]!.commandHandler(api);

  expect(api.core.useCompletion().close).toHaveBeenCalled();
});

test('candidate contains original file data', async () => {
  const api = createMockApi();

  const file: FileMeta = {
    id: 'data-id',
    filePath: ['data.org'],
    title: 'Data File',
    tags: ['test'],
  };
  mockFiles.push(file);

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.data).toEqual(file);
});

test('search returns total from lastSearchResult', async () => {
  const api = createMockApi();

  for (let i = 0; i < 100; i++) {
    mockFiles.push({ id: `${i}`, filePath: [`meeting${i}.org`], title: `Meeting ${i}` });
  }

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('Meeting', 10, 0)) as CompletionSearchResult;

  expect(result.total).toBeGreaterThan(0);
});

test('empty query returns total from count', async () => {
  const api = createMockApi();

  for (let i = 0; i < 50; i++) {
    mockFiles.push({ id: `${i}`, filePath: [`note${i}.org`], title: `Note ${i}` });
  }

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 10, 0)) as CompletionSearchResult;

  expect(result.total).toBe(50);
});

test('whitespace-only query returns recent files', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['recent.org'], title: 'Recent' });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('   ', 20, 0)) as CompletionSearchResult;

  expect(result.result).toHaveLength(1);
});

test('search by tags returns matching files', async () => {
  const api = createMockApi();

  mockFiles.push(
    { id: '1', filePath: ['work.org'], title: 'Work', tags: ['work'] },
    { id: '2', filePath: ['personal.org'], title: 'Personal', tags: ['personal'] },
  );

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('work', 20, 0)) as CompletionSearchResult;

  expect(result.result).toHaveLength(1);
  expect((result.result[0]!.data as FileMeta)?.tags).toContain('work');
});

test('candidate description handles missing description and tags', async () => {
  const api = createMockApi();

  mockFiles.push({ id: '1', filePath: ['minimal.org'], title: 'Minimal' });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.description).toBe('');
});

test('candidate description combines description and tags', async () => {
  const api = createMockApi();

  mockFiles.push({
    id: '1',
    filePath: ['combined.org'],
    title: 'Combined',
    description: 'A description',
    tags: ['tag1'],
  });

  await useNoteSearchCompletion(api);

  const result = (await capturedCompletionConfig?.itemsGetter?.('', 20, 0)) as CompletionSearchResult;

  expect(result.result[0]!.description).toContain('A description');
  expect(result.result[0]!.description).toContain('#tag1');
});
