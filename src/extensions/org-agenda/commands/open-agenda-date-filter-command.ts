import type { Command, OrgNoteApi } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import DatePickerSheetModal from 'src/components/DatePickerSheetModal.vue';
import type { DatePickerSelection } from 'src/models/date-picker';
import {
  AGENDA_TASKS_CLEAR_DATE_FILTER_COMMAND,
  AGENDA_TASKS_DATE_FILTER_COMMAND,
  AGENDA_TASKS_URI,
} from '../constants';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';
import { resolveAgendaDateSelection } from '../utils/agenda-date-selection';

type DateSheetResult = { selection: DatePickerSelection | null } | undefined;

const openDateFilterSheet = async (api: OrgNoteApi): Promise<DateSheetResult> => {
  const filterStore = useAgendaFilterStore();
  const result = await to(
    () =>
      api.ui.useModal().open<DateSheetResult>(DatePickerSheetModal, {
        mini: true,
        modalProps: {
          modelValue: resolveAgendaDateSelection(filterStore.dateFilter),
          selectionMode: 'both',
          confirmMode: true,
        },
      }),
    'Failed to open Agenda date filter',
  )();
  if (result.isOk()) return result.value;
  reporter.reportError(result.error);
  return undefined;
};

const applyDateSelection = (selection: DatePickerSelection | null): void => {
  useAgendaFilterStore().setDateSelection(selection ?? undefined);
};

const openAgendaTasks = async (api: OrgNoteApi): Promise<void> => {
  const result = await to(
    api.core.useBufferViewer().open,
    'Failed to open Agenda tasks',
  )(AGENDA_TASKS_URI);
  if (result.isErr()) reporter.reportError(result.error);
};

const handleDateFilter = async (api: OrgNoteApi): Promise<void> => {
  const result = await openDateFilterSheet(api);
  if (!result) return;
  applyDateSelection(result.selection);
  await openAgendaTasks(api);
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
