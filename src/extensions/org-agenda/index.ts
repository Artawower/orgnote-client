import type { Command, Extension, OrgNoteApi } from 'orgnote-api';
import { object, optional, string, pipe, metadata } from 'valibot';
import { AgendaSidebarRef } from './agenda-sidebar-ref';
import {
  AGENDA_HABITS_COMMAND,
  AGENDA_HABITS_PATTERN,
  AGENDA_HABITS_URI,
  AGENDA_POMODORO_COMMAND,
  AGENDA_POMODORO_PATTERN,
  AGENDA_POMODORO_URI,
  AGENDA_TASKS_COMMAND,
  AGENDA_TASKS_PATTERN,
  AGENDA_TASKS_VIEWER_ID,
  AGENDA_HABITS_VIEWER_ID,
  AGENDA_POMODORO_VIEWER_ID,
} from './constants';

const createTasksCommand = (): Command => ({
  command: AGENDA_TASKS_COMMAND,
  group: 'agenda',
  icon: 'sym_o_checklist',
  handler: (api: OrgNoteApi) => {
    const sidebar = api.ui.useSidebar();
    if (sidebar.opened && sidebar.component === AgendaSidebarRef) {
      sidebar.close();
      return;
    }
    sidebar.openComponent(AgendaSidebarRef);
  },
});

const createHabitsCommand = (): Command => ({
  command: AGENDA_HABITS_COMMAND,
  group: 'agenda',
  icon: 'sym_o_loop',
  handler: (api: OrgNoteApi) => api.core.useBufferViewer().open(AGENDA_HABITS_URI),
});

const createPomodoroCommand = (): Command => ({
  command: AGENDA_POMODORO_COMMAND,
  group: 'agenda',
  icon: 'sym_o_timer',
  handler: (api: OrgNoteApi) => api.core.useBufferViewer().open(AGENDA_POMODORO_URI),
});

const registerViewers = (api: OrgNoteApi): void => {
  const viewer = api.core.useBufferViewer();
  viewer.register({
    pattern: AGENDA_TASKS_PATTERN,
    component: () => import('./AgendaTasksBuffer.vue'),
    meta: { id: AGENDA_TASKS_VIEWER_ID, name: 'Agenda Tasks', icon: 'sym_o_checklist' },
  });
  viewer.register({
    pattern: AGENDA_HABITS_PATTERN,
    component: () => import('./AgendaHabitsBuffer.vue'),
    meta: { id: AGENDA_HABITS_VIEWER_ID, name: 'Agenda Habits', icon: 'sym_o_loop' },
  });
  viewer.register({
    pattern: AGENDA_POMODORO_PATTERN,
    component: () => import('./AgendaPomodoroBuffer.vue'),
    meta: { id: AGENDA_POMODORO_VIEWER_ID, name: 'Agenda Pomodoro', icon: 'sym_o_timer' },
  });
};

const unregisterViewers = (api: OrgNoteApi): void => {
  const viewer = api.core.useBufferViewer();
  viewer.unregister(AGENDA_TASKS_VIEWER_ID);
  viewer.unregister(AGENDA_HABITS_VIEWER_ID);
  viewer.unregister(AGENDA_POMODORO_VIEWER_ID);
};

const registerCommands = (api: OrgNoteApi): void => {
  const commands = api.core.useCommands();
  commands.add(createTasksCommand());
  commands.add(createHabitsCommand());
  commands.add(createPomodoroCommand());
  api.ui.usePinnedCommands().addCommand('sidebar', AGENDA_TASKS_COMMAND);
};

const unregisterCommands = (api: OrgNoteApi): void => {
  const commands = api.core.useCommands();
  [AGENDA_TASKS_COMMAND, AGENDA_HABITS_COMMAND, AGENDA_POMODORO_COMMAND]
    .map((cmd) => commands.get(cmd))
    .filter(Boolean)
    .forEach((cmd) => commands.remove(cmd!));
  api.ui.usePinnedCommands().removeCommand('sidebar', AGENDA_TASKS_COMMAND);
};

const settingsSchema = object({
  agendaFilesPath: pipe(optional(string()), metadata({ filePicker: true })),
});

export type AgendaConfig = { agendaFilesPath?: string };

const defaultSettings: AgendaConfig = {
  agendaFilesPath: undefined,
};

export const resolveAgendaConfig = (rawConfig: Record<string, unknown>): AgendaConfig => ({
  agendaFilesPath:
    (rawConfig.agendaFilesPath as string | undefined) ?? defaultSettings.agendaFilesPath,
});

export const orgAgendaExtension: Extension = {
  settingsSchema,
  defaultSettings,
  onMounted: async (api) => {
    registerViewers(api);
    registerCommands(api);
  },
  onUnmounted: async (api) => {
    unregisterViewers(api);
    unregisterCommands(api);
  },
};

export { orgAgendaManifest } from './manifest';
