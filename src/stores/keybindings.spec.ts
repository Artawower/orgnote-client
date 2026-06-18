import { beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { KEYBINDING_CONTEXTS, type Command } from 'orgnote-api';
import { useCommandsStore } from './command';
import { useKeybindingsStore } from './keybindings';

vi.mock('./config', () => ({
  useConfigStore: vi.fn(() => ({
    config: {},
  })),
}));

const createTabEvent = (): KeyboardEvent =>
  new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });

beforeEach(() => {
  setActivePinia(createPinia());
});

test('keybindings dispatch enabled completion Tab command', () => {
  const commands = useCommandsStore();
  const keybindings = useKeybindingsStore();
  const handler = vi.fn();
  const command: Command = {
    command: 'accept test autocomplete',
    keybindingContext: KEYBINDING_CONTEXTS.COMPLETION,
    defaultHotkeys: [{ key: 'Tab' }],
    handler,
  };

  commands.add(command);
  const popContext = keybindings.pushContext(KEYBINDING_CONTEXTS.COMPLETION);
  const event = createTabEvent();

  window.dispatchEvent(event);
  popContext();

  expect(event.defaultPrevented).toBe(true);
  expect(handler).toHaveBeenCalledOnce();
});

test('keybindings do not prevent disabled completion Tab command', () => {
  const commands = useCommandsStore();
  const keybindings = useKeybindingsStore();
  const handler = vi.fn();
  const command: Command = {
    command: 'disabled test autocomplete',
    keybindingContext: KEYBINDING_CONTEXTS.COMPLETION,
    defaultHotkeys: [{ key: 'Tab' }],
    disabled: () => true,
    handler,
  };

  commands.add(command);
  const popContext = keybindings.pushContext(KEYBINDING_CONTEXTS.COMPLETION);
  const event = createTabEvent();

  window.dispatchEvent(event);
  popContext();

  expect(event.defaultPrevented).toBe(false);
  expect(handler).not.toHaveBeenCalled();
});

test('keybindings dispatch completion Tab before nested bubble handlers stop propagation', () => {
  const commands = useCommandsStore();
  const keybindings = useKeybindingsStore();
  const handler = vi.fn();
  const command: Command = {
    command: 'capture autocomplete',
    keybindingContext: KEYBINDING_CONTEXTS.COMPLETION,
    defaultHotkeys: [{ key: 'Tab' }],
    handler,
  };
  const input = document.createElement('input');
  input.addEventListener('keydown', (event) => event.stopPropagation());
  document.body.append(input);

  commands.add(command);
  const popContext = keybindings.pushContext(KEYBINDING_CONTEXTS.COMPLETION);
  const event = createTabEvent();

  input.dispatchEvent(event);
  popContext();
  input.remove();

  expect(event.defaultPrevented).toBe(true);
  expect(handler).toHaveBeenCalledOnce();
});
