import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { commandHistoryExtension } from './index';
import type { OrgNoteApi, Command, CompletionInterceptor, CompletionCandidate } from 'orgnote-api';
import { ref } from 'vue';

let registeredInterceptor: CompletionInterceptor<Command> | null = null;
const registeredAfterExecuteCallbacks = new Map<
  string,
  (command: Command, data: unknown, options?: unknown) => void
>();
let kvContent = '{}';
let unregisterInterceptorCalled = false;
let unregisterAfterExecuteCalled = 0;

const createMockApi = (): OrgNoteApi => {
  const mockCompletion = {
    open: vi.fn(),
    close: vi.fn(),
    registerInterceptor: vi.fn((interceptor: CompletionInterceptor<Command>) => {
      registeredInterceptor = interceptor;
      return () => {
        unregisterInterceptorCalled = true;
      };
    }),
  };

  const mockCommands = {
    commands: ref<Command[]>([
      { command: 'command-a', handler: vi.fn() },
      { command: 'command-b', handler: vi.fn() },
    ]),
    afterExecute: vi.fn(
      (commandName: string, callback: (command: Command, data: unknown, options?: unknown) => void) => {
        registeredAfterExecuteCallbacks.set(commandName, callback);
        return () => {
          unregisterAfterExecuteCalled += 1;
        };
      },
    ),
  };

  const mockKeyValueRepository = {
    get: vi.fn(async () => kvContent),
    set: vi.fn(async (_key: string, value: string) => {
      kvContent = value;
    }),
    delete: vi.fn(),
    clear: vi.fn(),
  };

  return {
    core: {
      useCompletion: vi.fn(() => mockCompletion),
      useCommands: vi.fn(() => mockCommands),
    },
    infrastructure: {
      keyValueRepository: mockKeyValueRepository,
    },
  } as unknown as OrgNoteApi;
};

beforeEach(() => {
  registeredInterceptor = null;
  registeredAfterExecuteCallbacks.clear();
  kvContent = '{}';
  unregisterInterceptorCalled = false;
  unregisterAfterExecuteCalled = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

test('commandHistoryExtension has onMounted function', () => {
  expect(commandHistoryExtension.onMounted).toBeDefined();
  expect(typeof commandHistoryExtension.onMounted).toBe('function');
});

test('commandHistoryExtension has onUnmounted function', () => {
  expect(commandHistoryExtension.onUnmounted).toBeDefined();
  expect(typeof commandHistoryExtension.onUnmounted).toBe('function');
});

test('commandHistoryExtension onMounted registers interceptor', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  expect(api.core.useCompletion().registerInterceptor).toHaveBeenCalled();
  expect(registeredInterceptor).not.toBeNull();
});

test('commandHistoryExtension registers interceptor with correct name', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  expect(registeredInterceptor?.name).toBe('command-history-sorter');
});

test('commandHistoryExtension registers interceptor targeting commands', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  expect(registeredInterceptor?.target).toBe('commands');
});

test('commandHistoryExtension registers interceptor with priority 100', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  expect(registeredInterceptor?.priority).toBe(100);
});

test('commandHistoryExtension onMounted registers afterExecute callback', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  expect(api.core.useCommands().afterExecute).toHaveBeenCalled();
  expect(registeredAfterExecuteCallbacks.size).toBe(2);
});

test('commandHistoryExtension onUnmounted unregisters interceptor', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);
  await commandHistoryExtension.onUnmounted?.(api);

  expect(unregisterInterceptorCalled).toBe(true);
});

test('commandHistoryExtension onUnmounted unregisters afterExecute callback', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);
  await commandHistoryExtension.onUnmounted?.(api);

  expect(unregisterAfterExecuteCalled).toBe(2);
});

test('commandHistoryExtension interceptor sorts recently used commands first', async () => {
  const api = createMockApi();
  kvContent = JSON.stringify({
    'command-b': '2024-01-02T12:00:00.000Z',
    'command-a': '2024-01-01T12:00:00.000Z',
  });

  await commandHistoryExtension.onMounted?.(api);

  const candidates: CompletionCandidate<Command>[] = [
    { data: { command: 'command-a', handler: vi.fn() }, title: 'Command A', commandHandler: vi.fn() },
    { data: { command: 'command-b', handler: vi.fn() }, title: 'Command B', commandHandler: vi.fn() },
    { data: { command: 'command-c', handler: vi.fn() }, title: 'Command C', commandHandler: vi.fn() },
  ];

  const result = await registeredInterceptor?.handler(candidates, {
    completionName: 'commands',
    searchQuery: '',
  });

  if (!result) {
    throw new Error('Expected interceptor result');
  }

  const first = result.at(0);
  const second = result.at(1);
  const third = result.at(2);

  if (!first || !second || !third) {
    throw new Error('Expected three sorted candidates');
  }

  expect(first.data.command).toBe('command-b');
  expect(second.data.command).toBe('command-a');
  expect(third.data.command).toBe('command-c');
});

test('commandHistoryExtension interceptor sorts unused commands alphabetically', async () => {
  const api = createMockApi();
  kvContent = '{}';

  await commandHistoryExtension.onMounted?.(api);

  const candidates: CompletionCandidate<Command>[] = [
    { data: { command: 'zebra', handler: vi.fn() }, title: 'Zebra', commandHandler: vi.fn() },
    { data: { command: 'apple', handler: vi.fn() }, title: 'Apple', commandHandler: vi.fn() },
    { data: { command: 'banana', handler: vi.fn() }, title: 'Banana', commandHandler: vi.fn() },
  ];

  const result = await registeredInterceptor?.handler(candidates, {
    completionName: 'commands',
    searchQuery: '',
  });

  if (!result) {
    throw new Error('Expected interceptor result');
  }

  const first = result.at(0);
  const second = result.at(1);
  const third = result.at(2);

  if (!first || !second || !third) {
    throw new Error('Expected three sorted candidates');
  }

  expect(first.title).toBe('Apple');
  expect(second.title).toBe('Banana');
  expect(third.title).toBe('Zebra');
});

test('commandHistoryExtension afterExecute callback tracks command usage with interactive option', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  const command: Command = {
    command: 'test-command',
    handler: vi.fn(),
  };

  const callback = registeredAfterExecuteCallbacks.get('command-a');
  await callback?.(command, undefined, { interactive: true });

  expect(api.infrastructure.keyValueRepository.set).toHaveBeenCalledWith(
    'command-history',
    expect.stringContaining('test-command'),
  );
});

test('commandHistoryExtension afterExecute callback ignores non-interactive executions', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  const command: Command = {
    command: 'test-command',
    handler: vi.fn(),
  };

  const callback = registeredAfterExecuteCallbacks.get('command-a');
  await callback?.(command, undefined, { interactive: false });

  expect(api.infrastructure.keyValueRepository.set).not.toHaveBeenCalled();
});

test('commandHistoryExtension handles empty history gracefully', async () => {
  const api = createMockApi();
  kvContent = '';

  await commandHistoryExtension.onMounted?.(api);

  const candidates: CompletionCandidate<Command>[] = [
    { data: { command: 'test', handler: vi.fn() }, title: 'Test', commandHandler: vi.fn() },
  ];

  const result = await registeredInterceptor?.handler(candidates, {
    completionName: 'commands',
    searchQuery: '',
  });

  expect(result).toHaveLength(1);
});

test('commandHistoryExtension handles undefined content gracefully', async () => {
  const api = createMockApi();
  (api.infrastructure.keyValueRepository.get as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  await commandHistoryExtension.onMounted?.(api);

  const candidates: CompletionCandidate<Command>[] = [
    { data: { command: 'test', handler: vi.fn() }, title: 'Test', commandHandler: vi.fn() },
  ];

  const result = await registeredInterceptor?.handler(candidates, {
    completionName: 'commands',
    searchQuery: '',
  });

  expect(result).toHaveLength(1);
});

test('commandHistoryExtension handles malformed history gracefully', async () => {
  const api = createMockApi();
  kvContent = 'invalid json';

  await commandHistoryExtension.onMounted?.(api);

  const candidates: CompletionCandidate<Command>[] = [
    { data: { command: 'test', handler: vi.fn() }, title: 'Test', commandHandler: vi.fn() },
  ];

  const result = await registeredInterceptor?.handler(candidates, {
    completionName: 'commands',
    searchQuery: '',
  });

  expect(result).toHaveLength(1);
});

test('commandHistoryExtension loads history from correct key', async () => {
  const api = createMockApi();

  await commandHistoryExtension.onMounted?.(api);

  const candidates: CompletionCandidate<Command>[] = [
    { data: { command: 'test', handler: vi.fn() }, title: 'Test', commandHandler: vi.fn() },
  ];

  await registeredInterceptor?.handler(candidates, {
    completionName: 'commands',
    searchQuery: '',
  });

  expect(api.infrastructure.keyValueRepository.get).toHaveBeenCalledWith('command-history');
});
