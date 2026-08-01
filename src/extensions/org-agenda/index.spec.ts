import { DefaultCommands, type Command, type OrgNoteApi } from 'orgnote-api';
import { beforeEach, expect, test, vi } from 'vitest';
import {
  AGENDA_HABITS_COMMAND,
  AGENDA_HABITS_URI,
  AGENDA_POMODORO_COMMAND,
  AGENDA_POMODORO_STATS_COMMAND,
  AGENDA_POMODORO_STATS_URI,
  AGENDA_POMODORO_URI,
  AGENDA_TASKS_VIEWER_ID,
} from './constants';
import { orgAgendaExtension } from './index';

const addedCommands: Command[] = [];
const execute = vi.fn();
const open = vi.fn();
const register = vi.fn();

const api = {
  core: {
    useBufferViewer: () => ({ open, register }),
    useCommands: () => ({ add: (...commands: Command[]) => addedCommands.push(...commands), execute }),
    usePane: () => ({ afterBufferActivated: vi.fn(() => vi.fn()) }),
  },
  ui: {
    useContextMenu: () => ({ addContextMenuAction: vi.fn(), registerGroup: vi.fn() }),
    usePinnedCommands: () => ({ addCommand: vi.fn() }),
  },
} as unknown as OrgNoteApi;

beforeEach(() => {
  addedCommands.length = 0;
  execute.mockReset();
  open.mockReset();
  register.mockReset();
});

test('Agenda Tasks viewer enables versioned view state', async () => {
  await orgAgendaExtension.onMounted!(api);

  expect(register).toHaveBeenCalledWith(
    expect.objectContaining({
      meta: expect.objectContaining({
        id: AGENDA_TASKS_VIEWER_ID,
        viewState: { version: 1 },
      }),
    }),
  );
});

test.each([
  [AGENDA_HABITS_COMMAND, AGENDA_HABITS_URI],
  [AGENDA_POMODORO_COMMAND, AGENDA_POMODORO_URI],
  [AGENDA_POMODORO_STATS_COMMAND, AGENDA_POMODORO_STATS_URI],
])('%s shows an existing buffer before opening another view', async (commandName, uri) => {
  await orgAgendaExtension.onMounted!(api);
  const command = addedCommands.find(({ command }) => command === commandName)!;

  await command.handler(api, { data: undefined, meta: command });

  expect(execute).toHaveBeenCalledWith(DefaultCommands.SHOW_OR_OPEN_BUFFER, { uri });
  expect(open).not.toHaveBeenCalled();
});
