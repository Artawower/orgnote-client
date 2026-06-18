import { test, expect, vi } from 'vitest';
import { DefaultCommands, KEYBINDING_CONTEXTS, type OrgNoteApi } from 'orgnote-api';
import { getCompletionCommands } from './completion';

const createApi = (canAcceptAutocomplete: boolean): OrgNoteApi =>
  ({
    core: {
      useCompletion: () => ({
        canAcceptAutocomplete: vi.fn(() => canAcceptAutocomplete),
        acceptAutocomplete: vi.fn(),
        nextCandidate: vi.fn(),
        previousCandidate: vi.fn(),
      }),
      useCommands: () => ({
        execute: vi.fn(),
      }),
    },
  }) as unknown as OrgNoteApi;

const getAutocompleteCommand = () => {
  const command = getCompletionCommands().find(
    (command) => command.command === DefaultCommands.ACCEPT_COMPLETION_AUTOCOMPLETE,
  );
  if (!command) throw new Error('Expected autocomplete command');
  return command;
};

test('getCompletionCommands registers autocomplete command on Tab in completion context', () => {
  const command = getAutocompleteCommand();

  expect(command.defaultHotkeys).toEqual([{ key: 'Tab' }]);
  expect(command.keybindingContext).toBe(KEYBINDING_CONTEXTS.COMPLETION);
  expect(command.system).toBe(true);
});

test('getCompletionCommands disables autocomplete command when input-choice cannot accept', () => {
  const command = getAutocompleteCommand();
  const api = createApi(false);

  expect(command.disabled?.(api)).toBe(true);
});

test('getCompletionCommands enables autocomplete command when input-choice can accept', () => {
  const command = getAutocompleteCommand();
  const api = createApi(true);

  expect(command.disabled?.(api)).toBe(false);
});

test('getCompletionCommands autocomplete command calls completion store', () => {
  const command = getAutocompleteCommand();
  const acceptAutocomplete = vi.fn();
  const api = {
    core: {
      useCompletion: () => ({
        canAcceptAutocomplete: vi.fn(() => true),
        acceptAutocomplete,
      }),
    },
  } as unknown as OrgNoteApi;

  command.handler(api, { meta: command });

  expect(acceptAutocomplete).toHaveBeenCalledOnce();
});
