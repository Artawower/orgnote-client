import type { BufferActivatedEvent, BufferActivationUnsubscribe, OrgNoteApi } from 'orgnote-api';
import {
  AGENDA_HABITS_URI,
  AGENDA_POMODORO_STATS_URI,
  AGENDA_POMODORO_URI,
  AGENDA_TASKS_URI,
} from './constants';
import { AgendaSidebarRef } from './agenda-sidebar-ref';

const AGENDA_BUFFER_URIS = new Set([
  AGENDA_TASKS_URI,
  AGENDA_HABITS_URI,
  AGENDA_POMODORO_URI,
  AGENDA_POMODORO_STATS_URI,
]);

let unsubscribeBufferActivation: BufferActivationUnsubscribe | undefined;

const followAgendaBuffer = (api: OrgNoteApi, event: BufferActivatedEvent): void => {
  if (!api.core.useConfig().config.ui.followActiveBufferInSidebar) return;
  if (!event.current.uri || !AGENDA_BUFFER_URIS.has(event.current.uri)) return;
  api.ui.useSidebar().setComponent(AgendaSidebarRef);
};

export const disposeAgendaBufferFollow = (): void => {
  unsubscribeBufferActivation?.();
  unsubscribeBufferActivation = undefined;
};

export const registerAgendaBufferFollow = (api: OrgNoteApi): void => {
  disposeAgendaBufferFollow();
  unsubscribeBufferActivation = api.core
    .usePane()
    .afterBufferActivated((event) => followAgendaBuffer(api, event), { immediate: true });
};
