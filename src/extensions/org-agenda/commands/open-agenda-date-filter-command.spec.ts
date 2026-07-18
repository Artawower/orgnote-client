import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { OrgNoteApi } from 'orgnote-api';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';
import {
  clearAgendaDateFilterCommand,
  openAgendaDateFilterCommand,
} from './open-agenda-date-filter-command';

const openModal = vi.fn();
const openBuffer = vi.fn();
const api = {
  ui: { useModal: () => ({ open: openModal }) },
  core: { useBufferViewer: () => ({ open: openBuffer }) },
} as unknown as OrgNoteApi;

beforeEach(() => {
  setActivePinia(createPinia());
  openModal.mockReset();
  openBuffer.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

test('openAgendaDateFilterCommand applies the selected range and opens Agenda tasks', async () => {
  openModal.mockResolvedValue({
    selection: { from: '2026-05-14', to: '2026-05-18' },
  });

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });

  expect(useAgendaFilterStore().dateFilter).toEqual({
    kind: 'range',
    from: '2026-05-14',
    to: '2026-05-18',
  });
  expect(openBuffer).toHaveBeenCalledOnce();
});

test('openAgendaDateFilterCommand initializes the responsive picker from Tomorrow', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-14T12:00:00'));
  useAgendaFilterStore().setPresetFilter('tomorrow');
  openModal.mockResolvedValue(undefined);

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });

  expect(openModal).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      modalProps: {
        modelValue: '2026-05-15',
        selectionMode: 'both',
        confirmMode: true,
      },
    }),
  );
  expect(useAgendaFilterStore().dateFilter).toEqual({ kind: 'preset', value: 'tomorrow' });
  expect(openBuffer).not.toHaveBeenCalled();
});

test('openAgendaDateFilterCommand applies a selected non-Today single day', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-14T12:00:00'));
  openModal.mockResolvedValue({ selection: '2026-05-18' });

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });

  expect(useAgendaFilterStore().dateFilter).toEqual({
    kind: 'day',
    value: '2026-05-18',
  });
});

test('openAgendaDateFilterCommand maps a selected single Today to the Today preset', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-18T12:00:00'));
  openModal.mockResolvedValue({ selection: '2026-05-18' });

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });

  expect(useAgendaFilterStore().dateFilter).toEqual({ kind: 'preset', value: 'today' });
});

test('clearAgendaDateFilterCommand clears dates without clearing task search', async () => {
  const store = useAgendaFilterStore();
  store.searchQuery = 'quarterly';
  store.setDateRange('2026-05-14', '2026-05-18');

  await clearAgendaDateFilterCommand.handler(api, { meta: clearAgendaDateFilterCommand });

  expect(store.dateFilter).toEqual({ kind: 'preset', value: 'all' });
  expect(store.searchQuery).toBe('quarterly');
});
