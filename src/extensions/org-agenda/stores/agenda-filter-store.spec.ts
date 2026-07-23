import { beforeEach, expect, test } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAgendaFilterStore } from './agenda-filter-store';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('AgendaFilterStore selects an inclusive date range independently from search text', () => {
  const store = useAgendaFilterStore();
  store.searchQuery = 'quarterly review';

  store.setDateRange('2026-05-16', '2026-05-14');

  expect(store.searchQuery).toBe('quarterly review');
  expect(store.dateFilter).toEqual({ kind: 'range', from: '2026-05-14', to: '2026-05-16' });
  expect(store.activePreset).toBeUndefined();
});

test('AgendaFilterStore preserves a selected non-Today day', () => {
  const store = useAgendaFilterStore();

  store.setDateSelection('2026-05-20', '2026-05-18');

  expect(store.dateFilter).toEqual({ kind: 'day', value: '2026-05-20' });
});

test('AgendaFilterStore maps a selected single Today to the Today preset', () => {
  const store = useAgendaFilterStore();

  store.setDateSelection('2026-05-18', '2026-05-18');

  expect(store.dateFilter).toEqual({ kind: 'preset', value: 'today' });
});

test('AgendaFilterStore keeps a Today-only range exact', () => {
  const store = useAgendaFilterStore();

  store.setDateSelection(
    { from: '2026-05-18', to: '2026-05-18' },
    '2026-05-18',
  );

  expect(store.dateFilter).toEqual({
    kind: 'range',
    from: '2026-05-18',
    to: '2026-05-18',
  });
});

test('AgendaFilterStore selects and clears a file independently from task query controls', () => {
  const store = useAgendaFilterStore();
  store.searchQuery = 'quarterly';
  store.setDateRange('2026-05-14', '2026-05-18');

  store.setFileFilter('/agenda/work.org');

  expect(store.selectedFilePath).toBe('/agenda/work.org');
  expect(store.searchQuery).toBe('quarterly');
  expect(store.dateFilter.kind).toBe('range');

  store.setFileFilter();

  expect(store.selectedFilePath).toBeUndefined();
});
