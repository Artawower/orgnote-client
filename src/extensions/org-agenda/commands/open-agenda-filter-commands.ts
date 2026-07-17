import type { Command, OrgNoteApi } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import {
  clearAgendaDateFilterCommand,
  openAgendaDateFilterCommand,
} from './open-agenda-date-filter-command';
import type { AgendaFilter } from '../composables/use-agenda-tasks';
import {
  AGENDA_TASKS_URI,
  AGENDA_TASKS_TODAY_COMMAND,
  AGENDA_TASKS_TOMORROW_COMMAND,
  AGENDA_TASKS_NEXT7DAYS_COMMAND,
  AGENDA_TASKS_OVERDUE_COMMAND,
  AGENDA_TASKS_ALL_COMMAND,
} from '../constants';

const openAgendaWithFilter = async (filter: AgendaFilter, api: OrgNoteApi): Promise<void> => {
  const { useAgendaFilterStore } = await import('../stores/agenda-filter-store');
  useAgendaFilterStore().setPresetFilter(filter);
  const result = await to(() => api.core.useBufferViewer().open(AGENDA_TASKS_URI))();
  if (result.isErr()) {
    reporter.reportError(new Error('Failed to open agenda tasks', { cause: result.error }));
  }
};

const buildFilterCommand = (
  command: string,
  icon: string,
  filter: AgendaFilter,
): Command => ({
  command,
  group: 'agenda',
  icon,
  interactive: true,
  handler: (api) => openAgendaWithFilter(filter, api),
});

export const agendaFilterCommands: readonly Command[] = [
  buildFilterCommand(AGENDA_TASKS_TODAY_COMMAND, 'sym_o_today', 'today'),
  buildFilterCommand(AGENDA_TASKS_TOMORROW_COMMAND, 'sym_o_wb_sunny', 'tomorrow'),
  buildFilterCommand(AGENDA_TASKS_NEXT7DAYS_COMMAND, 'sym_o_date_range', 'next7days'),
  buildFilterCommand(AGENDA_TASKS_OVERDUE_COMMAND, 'sym_o_running_with_errors', 'overdue'),
  buildFilterCommand(AGENDA_TASKS_ALL_COMMAND, 'sym_o_checklist', 'all'),
  openAgendaDateFilterCommand,
  clearAgendaDateFilterCommand,
];
