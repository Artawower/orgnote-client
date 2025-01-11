import { test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useToolbarStore } from './toolbar';
import { DefaultCommands, type CommandName } from 'orgnote-api';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('initial state', () => {
  const store = useToolbarStore();

  expect(store.commands).toEqual([
    DefaultCommands.TOGGLE_SIDEBAR,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.TOGGLE_COMMANDS,
  ]);
});

test('addCommand adds a new command to the toolbar', () => {
  const store = useToolbarStore();

  const newCommand: CommandName = 'CUSTOM_COMMAND';
  store.addCommand(newCommand);

  expect(store.commands).toContain(newCommand);
  expect(store.commands.length).toBe(5);
});

test('addCommand does not add duplicate commands', () => {
  const store = useToolbarStore();

  const existingCommand: CommandName = DefaultCommands.TOGGLE_SIDEBAR;
  store.addCommand(existingCommand);

  const occurrences = store.commands.filter((cmd) => cmd === existingCommand).length;

  expect(occurrences).toBe(1);
});

test('removeCommand removes an existing command from the toolbar', () => {
  const store = useToolbarStore();

  const commandToRemove: CommandName = DefaultCommands.CREATE_NOTE;
  store.removeCommand(commandToRemove);

  expect(store.commands).not.toContain(commandToRemove);
  expect(store.commands.length).toBe(3);
});

test('removeCommand does nothing if the command does not exist', () => {
  const store = useToolbarStore();

  const nonExistingCommand: CommandName = 'NON_EXISTENT_COMMAND';
  const initialLength = store.commands.length;

  store.removeCommand(nonExistingCommand);

  expect(store.commands.length).toBe(initialLength);
});
