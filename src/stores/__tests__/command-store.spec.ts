import 'fake-indexeddb/auto';
import { setActivePinia, createPinia } from 'pinia';
import { test, expect, beforeEach } from 'vitest';
import { useCommandsStore } from '../command-store';
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

  store.add(mockCommand);

  expect(store.commands).toHaveLength(1);
  expect(store.commands[0]).toEqual(mockCommand);
});

test('does not add commands when no arguments are provided', () => {
  const store = useCommandsStore();

  store.add(); // No commands passed

  expect(store.commands).toHaveLength(0);
});

test('removes commands correctly', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };

  store.add(mockCommand);
  expect(store.commands).toHaveLength(1);

  store.remove(mockCommand);

  expect(store.commands).toHaveLength(0);
});

test('does not remove non-existent commands', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };
  const nonExistentCommand: Command = {
    command: 'non-existent',
    handler: () => 'no-op',
  };

  store.add(mockCommand);
  expect(store.commands).toHaveLength(1);

  store.remove(nonExistentCommand);

  expect(store.commands).toHaveLength(1);
});

test('retrieves commands by name correctly', () => {
  const store = useCommandsStore();
  const mockCommand: Command = {
    command: 'test-command',
    handler: () => 'test-result',
  };

  store.add(mockCommand);

  const retrievedCommand = store.get('test-command');
  expect(retrievedCommand).toEqual(mockCommand);
});

test('returns undefined when retrieving a non-existent command', () => {
  const store = useCommandsStore();

  const retrievedCommand = store.get('non-existent-command');
  expect(retrievedCommand).toBeUndefined();
});

test('adds multiple commands correctly', () => {
  const store = useCommandsStore();
  const commands: Command[] = [
    { command: 'command1', handler: () => 'result1' },
    { command: 'command2', handler: () => 'result2' },
    { command: 'command3', handler: () => 'result3' },
  ];

  store.add(...commands);

  expect(store.commands).toHaveLength(3);
  expect(store.commands).toEqual(commands);
});

test('removes multiple commands correctly', () => {
  const store = useCommandsStore();
  const commands: Command[] = [
    { command: 'command1', handler: () => 'result1' },
    { command: 'command2', handler: () => 'result2' },
    { command: 'command3', handler: () => 'result3' },
  ];

  store.add(...commands);
  store.remove(commands[0]!, commands[2]!); // Remove first and last commands

  expect(store.commands).toHaveLength(1);
  expect(store.commands[0]).toEqual(commands[1]); // Only the middle command remains
});

test('handles duplicate command registration gracefully', () => {
  const store = useCommandsStore();
  const command: Command = { command: 'command1', handler: () => 'result1' };

  store.add(command);
  store.add(command); // Attempt to add the same command again

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
  store.add(...commands);
  expect(store.commands).toHaveLength(3);

  // Step 2: Remove one command
  store.remove(commands[1]!); // Remove the second command
  expect(store.commands).toHaveLength(2);
  expect(store.commands).toEqual([commands[0], commands[2]]);

  // Step 3: Add one more command
  const newCommand: Command = { command: 'command4', handler: () => 'result4' };
  store.add(newCommand);
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

  store.add(...commands);
  store.remove(commands[1]!); // Remove the second command

  expect(store.get('command1')).toEqual(commands[0]); // First command exists
  expect(store.get('command2')).toBeUndefined(); // Removed command does not exist
  expect(store.get('command3')).toEqual(commands[2]); // Third command exists
});
