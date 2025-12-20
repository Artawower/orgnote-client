import { test, expect, vi, beforeEach } from 'vitest';
import type { Command } from 'orgnote-api';
import { RouteNames } from 'orgnote-api';

const mockModal = {
  open: vi.fn(),
  component: null as unknown,
  close: vi.fn(),
};

const mockSettingsRouter = {
  push: vi.fn(),
};

const mockApi = {
  ui: {
    useModal: vi.fn(() => mockModal),
    useConfirmationModal: vi.fn(() => ({
      confirm: vi.fn(),
    })),
  },
  core: {
    app: {
      _context: {
        provides: {
          [Symbol.for('settings-router')]: mockSettingsRouter,
        },
      },
    },
    useAuth: vi.fn(() => ({
      user: null,
    })),
  },
  infrastructure: {},
  utils: {},
  vue: {},
};

vi.mock('src/boot/api', () => ({
  api: mockApi,
}));

vi.mock('src/composables/use-route-active', () => ({
  useRouteActive: vi.fn(() => ({
    isActive: vi.fn().mockReturnValue(false),
  })),
}));

vi.mock('src/constants/app-providers', () => ({
  SETTINGS_ROUTER_PROVIDER_TOKEN: Symbol.for('settings-router'),
}));

vi.mock('src/containers/TheSettings.vue', () => ({
  default: { name: 'TheSettings' },
}));

const mockDefineAsyncComponent = <T>(factory: () => T): T => factory();

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    defineAsyncComponent: vi.fn(mockDefineAsyncComponent),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockModal.component = null;
});

test('openSettingsRoute opens settings modal with wide layout', async () => {
  const { getSettingsCommands } = await import('./settings-commands');
  const commands = getSettingsCommands();
  const settingsCommand = commands.find((cmd) => cmd.command === 'settings');

  expect(settingsCommand).toBeDefined();
  if (settingsCommand) {
    settingsCommand.handler(mockApi as never, { data: {}, meta: {} });
  }

  expect(mockModal.open).toHaveBeenCalledWith(
    expect.any(Object),
    expect.objectContaining({
      wide: true,
      modalProps: {
        initialRoute: RouteNames.SettingsPage,
      },
    }),
  );
});

test('openSettingsRoute reuses existing modal without reopening', async () => {
  const { getSettingsCommands } = await import('./settings-commands');
  const commands = getSettingsCommands();
  const settingsCommand = commands.find((cmd) => cmd.command === 'settings');

  const TheSettingsComponent = (await import('src/containers/TheSettings.vue')).default;
  mockModal.component = TheSettingsComponent;

  if (settingsCommand) {
    settingsCommand.handler(mockApi as never, { data: {}, meta: {} });
  }

  expect(mockModal.open).not.toHaveBeenCalled();
  expect(mockSettingsRouter.push).toHaveBeenCalledWith({
    name: RouteNames.SettingsPage,
  });
});

test('getSettingsCommands export available', async () => {
  const { getSettingsCommands } = await import('./settings-commands');
  const commands = getSettingsCommands();

  expect(Array.isArray(commands)).toBe(true);
  expect(commands.length).toBeGreaterThan(0);
  expect(
    commands.every(
      (cmd: Command) => typeof cmd.command === 'string' && typeof cmd.handler === 'function',
    ),
  ).toBe(true);
});
