import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { OrgNoteApi } from 'orgnote-api';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';
import {
  clearAgendaDateFilterCommand,
  openAgendaDateFilterCommand,
} from './open-agenda-date-filter-command';

const openModal = vi.fn();
const closeModal = vi.fn();
const openBuffer = vi.fn();
const api = {
  ui: { useModal: () => ({ open: openModal, close: closeModal }) },
  core: { useBufferViewer: () => ({ open: openBuffer }) },
} as unknown as OrgNoteApi;

beforeEach(() => {
  setActivePinia(createPinia());
  openModal.mockReset();
  closeModal.mockReset();
  openBuffer.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

test('openAgendaDateFilterCommand applies the selected range and opens Agenda tasks', async () => {
  openModal.mockResolvedValue({ action: 'apply', from: '2026-05-14', to: '2026-05-18' });

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });

  expect(useAgendaFilterStore().dateFilter).toEqual({
    kind: 'range',
    from: '2026-05-14',
    to: '2026-05-18',
  });
  expect(openBuffer).toHaveBeenCalledOnce();
});

test('openAgendaDateFilterCommand initializes the calendar from Tomorrow', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-14T12:00:00'));
  useAgendaFilterStore().setPresetFilter('tomorrow');
  openModal.mockResolvedValue(undefined);

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });

  expect(openModal).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      modalProps: expect.objectContaining({ from: '2026-05-15', to: '2026-05-15' }),
    }),
  );
  expect(useAgendaFilterStore().dateFilter).toEqual({ kind: 'preset', value: 'tomorrow' });
  expect(openBuffer).not.toHaveBeenCalled();
});

test('openAgendaDateFilterCommand maps picker apply events to modal results', async () => {
  openModal.mockResolvedValue(undefined);

  await openAgendaDateFilterCommand.handler(api, { meta: openAgendaDateFilterCommand });
  const modalEmits = openModal.mock.calls[0]?.[1]?.modalEmits as
    | { apply: (range: { from: string; to: string }) => void }
    | undefined;
  modalEmits?.apply({ from: '2026-05-14', to: '2026-05-18' });

  expect(closeModal).toHaveBeenCalledWith({
    action: 'apply',
    from: '2026-05-14',
    to: '2026-05-18',
  });
});

test('clearAgendaDateFilterCommand clears dates without clearing task search', async () => {
  const store = useAgendaFilterStore();
  store.searchQuery = 'quarterly';
  store.setDateRange('2026-05-14', '2026-05-18');

  await clearAgendaDateFilterCommand.handler(api, { meta: clearAgendaDateFilterCommand });

  expect(store.dateFilter).toEqual({ kind: 'preset', value: 'all' });
  expect(store.searchQuery).toBe('quarterly');
});
