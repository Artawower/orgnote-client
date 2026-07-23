import type { Command, CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import {
  clearAgendaDateFilterCommand,
  openAgendaDateFilterCommand,
} from './open-agenda-date-filter-command';
import type { AgendaFilter } from '../composables/use-agenda-tasks';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';
import {
  AGENDA_TASKS_URI,
  AGENDA_TASKS_TODAY_COMMAND,
  AGENDA_TASKS_TOMORROW_COMMAND,
  AGENDA_TASKS_NEXT7DAYS_COMMAND,
  AGENDA_TASKS_OVERDUE_COMMAND,
  AGENDA_TASKS_ALL_COMMAND,
  AGENDA_TASKS_FILE_FILTER_COMMAND,
} from '../constants';

const openAgendaTasks = async (api: OrgNoteApi): Promise<void> => {
  const result = await to(() => api.core.useBufferViewer().open(AGENDA_TASKS_URI))();
  if (result.isErr()) {
    reporter.reportError(new Error('Failed to open agenda tasks', { cause: result.error }));
  }
};

const openAgendaWithFilter = async (filter: AgendaFilter, api: OrgNoteApi): Promise<void> => {
  useAgendaFilterStore().setPresetFilter(filter);
  await openAgendaTasks(api);
};

interface AgendaFileFilterCommandData {
  readonly filePath?: string;
}

export const openAgendaFileFilterCommand: Command<AgendaFileFilterCommandData> = {
  command: AGENDA_TASKS_FILE_FILTER_COMMAND,
  group: 'agenda',
  icon: 'sym_o_description',
  system: true,
  handler: async (
    api: OrgNoteApi,
    params: CommandHandlerParams<AgendaFileFilterCommandData>,
  ): Promise<void> => {
    useAgendaFilterStore().setFileFilter(params.data?.filePath);
    await openAgendaTasks(api);
  },
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
  openAgendaFileFilterCommand,
  openAgendaDateFilterCommand,
  clearAgendaDateFilterCommand,
];
