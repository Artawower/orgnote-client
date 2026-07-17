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
