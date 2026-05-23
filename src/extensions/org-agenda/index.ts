import type { AsyncComponentLoader } from 'vue';
import type { Command, Extension, OrgNoteApi } from 'orgnote-api';
import { object, optional, string, pipe, metadata } from 'valibot';
import { createTaskCommand } from './commands/create-task-command';
import { AgendaSidebarRef } from './agenda-sidebar-ref';
import {
  AGENDA_CREATE_TASK,
  AGENDA_HABITS_COMMAND,
  AGENDA_HABITS_PATTERN,
  AGENDA_HABITS_URI,
  AGENDA_HABITS_VIEWER_ID,
  AGENDA_POMODORO_COMMAND,
  AGENDA_POMODORO_PATTERN,
  AGENDA_POMODORO_URI,
  AGENDA_POMODORO_VIEWER_ID,
  AGENDA_TASKS_COMMAND,
  AGENDA_TASKS_PATTERN,
  AGENDA_TASKS_VIEWER_ID,
} from './constants';

interface AgendaView {
  viewerId: string;
  pattern: string;
  name: string;
  icon: string;
  command: string;
  component: AsyncComponentLoader;
  handler: (api: OrgNoteApi) => void | Promise<void>;
  pinned?: boolean;
}

const toggleTasksSidebar = (api: OrgNoteApi): void => {
  const sidebar = api.ui.useSidebar();
  if (sidebar.opened && sidebar.component === AgendaSidebarRef) {
    sidebar.close();
    return;
  }
  sidebar.openComponent(AgendaSidebarRef);
};

const openBuffer =
  (uri: string) =>
  (api: OrgNoteApi): Promise<void> =>
    api.core.useBufferViewer().open(uri);

const AGENDA_VIEWS: readonly AgendaView[] = [
  {
    viewerId: AGENDA_TASKS_VIEWER_ID,
    pattern: AGENDA_TASKS_PATTERN,
    name: 'Agenda Tasks',
    icon: 'sym_o_checklist',
    command: AGENDA_TASKS_COMMAND,
    component: () => import('./AgendaTasksBuffer.vue'),
    handler: toggleTasksSidebar,
    pinned: true,
  },
  {
    viewerId: AGENDA_HABITS_VIEWER_ID,
    pattern: AGENDA_HABITS_PATTERN,
    name: 'Agenda Habits',
    icon: 'sym_o_check_circle_unread',
    command: AGENDA_HABITS_COMMAND,
    component: () => import('./AgendaHabitsBuffer.vue'),
    handler: openBuffer(AGENDA_HABITS_URI),
    pinned: true,
  },
  {
    viewerId: AGENDA_POMODORO_VIEWER_ID,
    pattern: AGENDA_POMODORO_PATTERN,
    name: 'Agenda Pomodoro',
    icon: 'sym_o_timer',
    command: AGENDA_POMODORO_COMMAND,
    component: () => import('./AgendaPomodoroBuffer.vue'),
    handler: openBuffer(AGENDA_POMODORO_URI),
  },
];

const buildCommand = (view: AgendaView): Command => ({
  command: view.command,
  group: 'agenda',
  icon: view.icon,
  handler: view.handler,
});

const registerViews = (api: OrgNoteApi): void => {
  const viewer = api.core.useBufferViewer();
  const commands = api.core.useCommands();
  const pinned = api.ui.usePinnedCommands();
  AGENDA_VIEWS.forEach((view) => {
    viewer.register({
      pattern: view.pattern,
      component: view.component,
      meta: { id: view.viewerId, name: view.name, icon: view.icon },
    });
    commands.add(buildCommand(view));
    if (view.pinned) pinned.addCommand('sidebar', view.command);
  });
  commands.add(createTaskCommand);
};

const unregisterViews = (api: OrgNoteApi): void => {
  const viewer = api.core.useBufferViewer();
  const commands = api.core.useCommands();
  const pinned = api.ui.usePinnedCommands();
  AGENDA_VIEWS.forEach((view) => {
    viewer.unregister(view.viewerId);
    const existing = commands.get(view.command);
    if (existing) commands.remove(existing);
    if (view.pinned) pinned.removeCommand('sidebar', view.command);
  });
  const existing = commands.get(AGENDA_CREATE_TASK);
  if (existing) commands.remove(existing);
};

const settingsSchema = object({
  agendaFilesPath: pipe(optional(string()), metadata({ directoryPicker: true })),
  inboxFilePath: pipe(
    optional(string()),
    metadata({ filePicker: true, defaultValue: 'inbox.org' }),
  ),
});

type AgendaConfig = { agendaFilesPath?: string; inboxFilePath?: string };

const defaultSettings: AgendaConfig = {
  agendaFilesPath: undefined,
  inboxFilePath: undefined,
};

export const resolveAgendaConfig = (rawConfig: Record<string, unknown>): AgendaConfig => ({
  agendaFilesPath:
    (rawConfig.agendaFilesPath as string | undefined) ?? defaultSettings.agendaFilesPath,
  inboxFilePath: (rawConfig.inboxFilePath as string | undefined) ?? defaultSettings.inboxFilePath,
});

export const orgAgendaExtension: Extension = {
  settingsSchema,
  defaultSettings,
  onMounted: async (api) => registerViews(api),
  onUnmounted: async (api) => unregisterViews(api),
};

export { orgAgendaManifest } from './manifest';
