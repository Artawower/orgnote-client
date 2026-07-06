import type { Command } from 'orgnote-api';
import { AGENDA_POMODORO_START_COMMAND } from '../constants';
import { createStartSessionHandler } from './start-session';

export const startPomodoroCommand: Command = {
  command: AGENDA_POMODORO_START_COMMAND,
  group: 'agenda',
  icon: 'sym_o_timer',
  handler: createStartSessionHandler((store) => store.sessionType),
};
