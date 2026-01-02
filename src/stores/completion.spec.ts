import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCompletionStore } from './completion';

const mockModalClose = vi.fn();
const mockModalOpen = vi.fn(() => Promise.resolve(undefined));
const mockModalCloseAll = vi.fn();

vi.mock('./modal', () => ({
  useModalStore: vi.fn(() => ({
    open: mockModalOpen,
    close: mockModalClose,
    closeAll: mockModalCloseAll,
  })),
}));

vi.mock('./config', () => ({
  useConfigStore: vi.fn(() => ({
    config: {
      completion: {
        defaultCompletionLimit: 20,
        showGroup: false,
      },
    },
  })),
}));

vi.mock('src/containers/AppCompletion.vue', () => ({
  default: { name: 'AppCompletion' },
}));

beforeEach(() => {
  setActivePinia(createPinia());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

test('open calls modal.open with correct config', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    placeholder: 'Search...',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  expect(mockModalOpen).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      noPadding: true,
      position: 'top',
    }),
  );
});

test('open with input type sets mini modal', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'input',
    placeholder: 'Enter value',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  expect(mockModalOpen).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      mini: true,
    }),
  );
});

test('open with choice type sets mini to false', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    placeholder: 'Select',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  expect(mockModalOpen).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      mini: false,
    }),
  );
});

test('open with searchText pre-fills query', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    searchText: 'initial query',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  vi.advanceTimersByTime(100);

  expect(store.activeCompletion?.searchQuery).toBe('initial query');
});

test('open creates active completion', async () => {
  const store = useCompletionStore();

  expect(store.activeCompletion).toBeUndefined();

  store.open({
    type: 'choice',
    placeholder: 'Test',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  expect(store.activeCompletion).toBeDefined();
  expect(store.activeCompletion?.type).toBe('choice');
});

test('nested completions stack in openedCompletions', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    placeholder: 'First',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  store.open({
    type: 'choice',
    placeholder: 'Second',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  store.open({
    type: 'choice',
    placeholder: 'Third',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  expect(store.activeCompletion?.placeholder).toBe('Third');
});

test('close calls modal.close with data', () => {
  const store = useCompletionStore();
  store.close({ selected: 'item' });

  expect(mockModalClose).toHaveBeenCalledWith({ selected: 'item' });
});

test('close calls modal.close without data', () => {
  const store = useCompletionStore();
  store.close();

  expect(mockModalClose).toHaveBeenCalledWith(undefined);
});

test('closeAll closes all modals and clears completions', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 0 }),
  });
  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  store.closeAll();

  expect(mockModalCloseAll).toHaveBeenCalled();
});

test('closeAll does not error when no completions open', () => {
  const store = useCompletionStore();
  expect(() => store.closeAll()).not.toThrow();
});

test('nextCandidate increments selectedCandidateIndex', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemsGetter: () => ({ result: [], total: 2 }) as any,
  });

  vi.advanceTimersByTime(100);

  store.activeCompletion!.total = 5;
  store.activeCompletion!.selectedCandidateIndex = 0;

  store.nextCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(1);
});

test('nextCandidate wraps from last to first', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 3 }),
  });

  store.activeCompletion!.total = 3;
  store.activeCompletion!.selectedCandidateIndex = 2;

  store.nextCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(0);
});

test('nextCandidate sets to 1 when index is null', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 5 }),
  });

  store.activeCompletion!.total = 5;
  store.activeCompletion!.selectedCandidateIndex = undefined;

  store.nextCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(1);
});

test('nextCandidate does nothing when no completion active', () => {
  const store = useCompletionStore();
  expect(() => store.nextCandidate()).not.toThrow();
});

test('nextCandidate does nothing when total is null', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  store.activeCompletion!.total = undefined;
  store.activeCompletion!.selectedCandidateIndex = 0;

  store.nextCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(0);
});

test('previousCandidate decrements selectedCandidateIndex', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 5 }),
  });

  store.activeCompletion!.total = 5;
  store.activeCompletion!.selectedCandidateIndex = 2;

  store.previousCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(1);
});

test('previousCandidate wraps from first to last', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 5 }),
  });

  store.activeCompletion!.total = 5;
  store.activeCompletion!.selectedCandidateIndex = 0;

  store.previousCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(4);
});

test('previousCandidate sets to last when index is null', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => ({ result: [], total: 5 }),
  });

  store.activeCompletion!.total = 5;
  store.activeCompletion!.selectedCandidateIndex = undefined;

  store.previousCandidate();
  expect(store.activeCompletion?.selectedCandidateIndex).toBe(4);
});

test('previousCandidate does nothing when no completion active', () => {
  const store = useCompletionStore();
  expect(() => store.previousCandidate()).not.toThrow();
});

test('search triggers itemsGetter on open', () => {
  const itemsGetter = vi.fn(() => ({ result: [], total: 0 }));
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter,
  });

  vi.advanceTimersByTime(100);

  expect(itemsGetter).toHaveBeenCalled();
});

test('search called with limit from config', () => {
  const itemsGetter = vi.fn(() => ({ result: [], total: 0 }));
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter,
  });

  vi.advanceTimersByTime(100);

  expect(itemsGetter).toHaveBeenCalledWith('', 20, 0);
});

test('search with leading option calls immediately', () => {
  const itemsGetter = vi.fn(() => ({ result: [], total: 0 }));
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter,
  });

  vi.advanceTimersByTime(100);

  expect(itemsGetter).toHaveBeenCalled();
});

test('search skipped for input type', () => {
  const itemsGetter = vi.fn(() => ({ result: [], total: 0 }));
  const store = useCompletionStore();

  store.open({
    type: 'input',
    itemsGetter,
  });

  vi.advanceTimersByTime(100);

  expect(itemsGetter).not.toHaveBeenCalled();
});

test('search handles async itemsGetter', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemsGetter: () => Promise.resolve({ result: [{ title: 'Result' }], total: 1 }) as any,
  });

  vi.advanceTimersByTime(100);
  await vi.runAllTimersAsync();

  expect(store.activeCompletion?.candidates).toHaveLength(1);
  expect(store.activeCompletion?.total).toBe(1);
});

test('search handles sync itemsGetter', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemsGetter: () => ({ result: [{ title: 'Sync Result' }], total: 1 }) as any,
  });

  vi.advanceTimersByTime(100);

  expect(store.activeCompletion?.candidates).toHaveLength(1);
});

test('search with offset merges into existing candidates', async () => {
  const store = useCompletionStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemsGetter = (query: string, limit?: number, offset?: number): any => {
    if (!offset) {
      return Promise.resolve({
        result: [{ title: 'Item 0' }, { title: 'Item 1' }],
        total: 10,
      });
    }
    return Promise.resolve({
      result: [{ title: 'Item 2' }, { title: 'Item 3' }],
      total: 10,
    });
  };

  store.open({
    type: 'choice',
    itemsGetter,
  });

  vi.advanceTimersByTime(100);
  await vi.runAllTimersAsync();

  expect(store.activeCompletion?.candidates).toHaveLength(2);

  store.search(20, 2);
  await vi.runAllTimersAsync();

  expect(store.activeCompletion?.candidates?.length).toBeGreaterThanOrEqual(4);
});

test('search sets selectedCandidateIndex to 0 on initial search', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemsGetter: () => Promise.resolve({ result: [{ title: 'a' }], total: 1 }) as any,
  });

  vi.advanceTimersByTime(100);
  await vi.runAllTimersAsync();

  expect(store.activeCompletion?.selectedCandidateIndex).toBe(0);
});

test('restore reopens last modal config', async () => {
  const store = useCompletionStore();

  const config = {
    type: 'choice' as const,
    placeholder: 'Restore Test',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemsGetter: () => ({ result: [], total: 0 }) as any,
  };

  mockModalOpen.mockResolvedValueOnce(undefined);

  const openPromise = store.open(config);
  await vi.runAllTimersAsync();
  await openPromise;

  mockModalOpen.mockClear();

  store.restore();

  expect(mockModalOpen).toHaveBeenCalled();
});

test('restore does nothing when no previous config', () => {
  const store = useCompletionStore();
  expect(() => store.restore()).not.toThrow();
  expect(mockModalOpen).not.toHaveBeenCalled();
});

test('activeCompletion returns last opened completion', () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    placeholder: 'First',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  store.open({
    type: 'input',
    placeholder: 'Second',
    itemsGetter: () => ({ result: [], total: 0 }),
  });

  expect(store.activeCompletion?.placeholder).toBe('Second');
  expect(store.activeCompletion?.type).toBe('input');
});

test('activeCompletion is undefined when no completions', () => {
  const store = useCompletionStore();
  expect(store.activeCompletion).toBeUndefined();
});

test('search updates total from result', async () => {
  const store = useCompletionStore();

  store.open({
    type: 'choice',
    itemsGetter: () => Promise.resolve({ result: [], total: 42 }),
  });

  vi.advanceTimersByTime(100);
  await vi.runAllTimersAsync();

  expect(store.activeCompletion?.total).toBe(42);
});
