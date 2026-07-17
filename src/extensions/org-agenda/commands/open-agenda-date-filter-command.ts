import { addDays, format, parseISO } from 'date-fns';
import type { Command, OrgNoteApi } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import DateRangePickerModal from 'src/components/DateRangePickerModal.vue';
import type { DateRange, DateRangePickerResult } from 'src/models/date-picker';
import { ISO_DATE_FORMAT, todayIsoDate } from 'src/utils/org-date';
import {
  AGENDA_TASKS_CLEAR_DATE_FILTER_COMMAND,
  AGENDA_TASKS_DATE_FILTER_COMMAND,
  AGENDA_TASKS_URI,
} from '../constants';
import type { AgendaDateFilter } from '../models/agenda-task-query';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';

const addIsoDays = (date: string, days: number): string =>
  format(addDays(parseISO(date), days), ISO_DATE_FORMAT);

const resolveInitialDates = (filter: AgendaDateFilter): { from: string; to: string } => {
  if (filter.kind === 'range') return { from: filter.from, to: filter.to };
  const today = todayIsoDate();
  if (filter.value === 'tomorrow') {
    const tomorrow = addIsoDays(today, 1);
    return { from: tomorrow, to: tomorrow };
  }
  if (filter.value === 'next7days') return { from: today, to: addIsoDays(today, 7) };
  return { from: today, to: today };
};

const openDateFilterModal = async (
  api: OrgNoteApi,
  filter: AgendaDateFilter,
): Promise<DateRangePickerResult | undefined> => {
  const dates = resolveInitialDates(filter);
  const modal = api.ui.useModal();
  const result = await to(
    () =>
      modal.open<DateRangePickerResult | undefined>(DateRangePickerModal, {
        mini: true,
        modalProps: dates,
        modalEmits: {
          apply: (range: DateRange) => modal.close({ action: 'apply', ...range }),
          clear: () => modal.close({ action: 'clear' }),
          cancel: () => modal.close(),
        },
      }),
    'Failed to open Agenda date filter',
  )();
  if (result.isErr()) {
    reporter.reportError(result.error);
    return undefined;
  }
  return result.value;
};

const applyDateFilterResult = (result: DateRangePickerResult): void => {
  const store = useAgendaFilterStore();
  if (result.action === 'clear') {
    store.clearDateFilter();
    return;
  }
  store.setDateRange(result.from, result.to);
};

const handleDateFilter = async (api: OrgNoteApi): Promise<void> => {
  const result = await openDateFilterModal(api, useAgendaFilterStore().dateFilter);
  if (!result) return;
  applyDateFilterResult(result);
  const openResult = await to(
    api.core.useBufferViewer().open,
    'Failed to open Agenda tasks',
  )(AGENDA_TASKS_URI);
  if (openResult.isErr()) reporter.reportError(openResult.error);
};

export const clearAgendaDateFilterCommand: Command = {
  command: AGENDA_TASKS_CLEAR_DATE_FILTER_COMMAND,
  group: 'agenda',
  icon: 'sym_o_close',
  handler: () => useAgendaFilterStore().clearDateFilter(),
};

export const openAgendaDateFilterCommand: Command = {
  command: AGENDA_TASKS_DATE_FILTER_COMMAND,
  group: 'agenda',
  icon: 'sym_o_calendar_month',
  interactive: true,
  handler: handleDateFilter,
};
