import { setActivePinia, createPinia } from 'pinia';
import { describe, test, expect, beforeEach } from 'vitest';
import { useCommandsStore } from '../commands-store';
import { type Command } from 'orgnote-api';

beforeEach(() => {
  setActivePinia(createPinia());
  process.env.CLIENT = 'true';
});

test('registers commands correctly', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };

  store.register(mockCommand);

  expect(store.commands).toHaveLength(1);
  expect(store.commands[0]).toEqual(mockCommand);
});

test('does not register commands when no arguments are provided', () => {
  const store = useCommandsStore();

  store.register(); // No commands passed

  expect(store.commands).toHaveLength(0);
});

test('unregisters commands correctly', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };

  store.register(mockCommand);
  expect(store.commands).toHaveLength(1);

  store.unregister(mockCommand);

  expect(store.commands).toHaveLength(0);
});

test('does not unregister non-existent commands', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };
  const nonExistentCommand: Command = {
    command: 'non-existent',
    handler: () => 'no-op',
  };

  store.register(mockCommand);
  expect(store.commands).toHaveLength(1);

  store.unregister(nonExistentCommand);

  expect(store.commands).toHaveLength(1);
});

test('retrieves commands by name correctly', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };

  store.register(mockCommand);

  const retrievedCommand = store.getCommand('test-command');
  expect(retrievedCommand).toEqual(mockCommand);
});

test('returns undefined when retrieving a non-existent command', () => {
  const store = useCommandsStore();

  const retrievedCommand = store.getCommand('non-existent-command');
  expect(retrievedCommand).toBeUndefined();
});

test('registers multiple commands correctly', () => {
  const store = useCommandsStore();
  const commands: Command[] = [
    { command: 'command1', handler: () => 'result1' },
    { command: 'command2', handler: () => 'result2' },
    { command: 'command3', handler: () => 'result3' },
  ];

  store.register(...commands);

  expect(store.commands).toHaveLength(3);
  expect(store.commands).toEqual(commands);
});

test('unregisters multiple commands correctly', () => {
  const store = useCommandsStore();
  const commands: Command[] = [
    { command: 'command1', handler: () => 'result1' },
    { command: 'command2', handler: () => 'result2' },
    { command: 'command3', handler: () => 'result3' },
  ];

  store.register(...commands);
  store.unregister(commands[0], commands[2]); // Remove first and last commands

  expect(store.commands).toHaveLength(1);
  expect(store.commands[0]).toEqual(commands[1]); // Only the middle command remains
});

test('handles duplicate command registration gracefully', () => {
  const store = useCommandsStore();
  const command: Command = { command: 'command1', handler: () => 'result1' };

  store.register(command);
  store.register(command); // Attempt to register the same command again

  expect(store.commands).toHaveLength(2); // Duplicate allowed in this implementation
  expect(store.commands[0]).toEqual(command);
  expect(store.commands[1]).toEqual(command);
});

test('correctly handles multiple adds and deletes in sequence', () => {
  const store = useCommandsStore();
  const commands: Command[] = [
    { command: 'command1', handler: () => 'result1' },
    { command: 'command2', handler: () => 'result2' },
    { command: 'command3', handler: () => 'result3' },
  ];

  // Step 1: Add commands
  store.register(...commands);
  expect(store.commands).toHaveLength(3);

  // Step 2: Remove one command
  store.unregister(commands[1]); // Remove the second command
  expect(store.commands).toHaveLength(2);
  expect(store.commands).toEqual([commands[0], commands[2]]);

  // Step 3: Add one more command
  const newCommand: Command = { command: 'command4', handler: () => 'result4' };
  store.register(newCommand);
  expect(store.commands).toHaveLength(3);
  expect(store.commands).toEqual([commands[0], commands[2], newCommand]);
});

test('correctly finds commands after multiple operations', () => {
  const store = useCommandsStore();
  const commands: Command[] = [
    { command: 'command1', handler: () => 'result1' },
    { command: 'command2', handler: () => 'result2' },
    { command: 'command3', handler: () => 'result3' },
  ];

  store.register(...commands);
  store.unregister(commands[1]); // Remove the second command

  expect(store.getCommand('command1')).toEqual(commands[0]); // First command exists
  expect(store.getCommand('command2')).toBeUndefined(); // Removed command does not exist
  expect(store.getCommand('command3')).toEqual(commands[2]); // Third command exists
});
