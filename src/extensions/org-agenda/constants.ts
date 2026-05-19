import { buildBufferUri } from 'orgnote-api';

export const AGENDA_TASKS_URI = buildBufferUri('builtin', '/agenda-tasks');
export const AGENDA_HABITS_URI = buildBufferUri('builtin', '/agenda-habits');
export const AGENDA_POMODORO_URI = buildBufferUri('builtin', '/agenda-pomodoro');

export const AGENDA_TASKS_PATTERN = '^/agenda-tasks$';
export const AGENDA_HABITS_PATTERN = '^/agenda-habits$';
export const AGENDA_POMODORO_PATTERN = '^/agenda-pomodoro$';

export const AGENDA_TASKS_COMMAND = 'open agenda tasks';
export const AGENDA_HABITS_COMMAND = 'open agenda habits';
export const AGENDA_POMODORO_COMMAND = 'open agenda pomodoro';

export const AGENDA_TASKS_VIEWER_ID = 'org-agenda:tasks';
export const AGENDA_HABITS_VIEWER_ID = 'org-agenda:habits';
export const AGENDA_POMODORO_VIEWER_ID = 'org-agenda:pomodoro';

export const TASK_DONE_KEYWORD = 'DONE';
export const TASK_TODO_KEYWORD = 'TODO';

export const AGENDA_CREATE_TASK = 'agenda: create task';

export const AGENDA_DEFAULT_INBOX_FILENAME = 'inbox.org';
