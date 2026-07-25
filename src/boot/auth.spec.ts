import { beforeEach, describe, expect, test, vi } from 'vitest';

const useAutoSyncMock = vi.fn();
const useAppResumeMock = vi.fn();
const verifyUserMock = vi.fn();
const runPostActivationSyncMock = vi.fn();
const reportWarningMock = vi.fn();

let activeBeforeVerify: string | undefined;
let activeAfterVerify: string | undefined;
let hasVerifiedUser: boolean;

const getFirstCallOrder = (mock: ReturnType<typeof vi.fn>): number =>
  mock.mock.invocationCallOrder[0] ?? 0;

const flushBackgroundTasks = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

vi.mock('@quasar/app-vite/wrappers', () => ({
  defineBoot: (bootFn: unknown) => bootFn,
}));

vi.mock('src/composables/use-auto-sync', () => ({
  useAutoSync: useAutoSyncMock,
}));

vi.mock('src/composables/use-app-resume', () => ({
  useAppResume: useAppResumeMock,
}));

vi.mock('src/composables/post-activation-sync', () => ({
  runPostActivationSync: runPostActivationSyncMock,
}));

vi.mock('./report', () => ({
  reporter: {
    reportWarning: reportWarningMock,
  },
}));

vi.mock('./api', () => ({
  api: {
    core: {
      useAuth: () => ({
        get user() {
          const active = hasVerifiedUser ? activeAfterVerify : activeBeforeVerify;
          return active ? { active } : null;
        },
        verifyUser: verifyUserMock,
      }),
      useSync: () => ({}),
    },
  },
}));

describe('auth boot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeBeforeVerify = undefined;
    activeAfterVerify = undefined;
    hasVerifiedUser = false;

    vi.stubGlobal('navigator', { onLine: true });
    verifyUserMock.mockImplementation(async () => {
      hasVerifiedUser = true;
    });
    runPostActivationSyncMock.mockResolvedValue(undefined);
  });

  test('does not block boot while user verification is pending', async () => {
    let resolveVerification: (() => void) | undefined;
    verifyUserMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveVerification = () => {
            hasVerifiedUser = true;
            resolve();
          };
        }),
    );

    const { default: bootAuth } = await import('./auth');

    const bootResult = bootAuth({} as never);

    expect(bootResult).toBeUndefined();
    resolveVerification?.();
    await flushBackgroundTasks();
  });

  test('does not block boot while initial sync is pending', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = 'pro';
    let resolveSync: (() => void) | undefined;
    runPostActivationSyncMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSync = resolve;
        }),
    );

    const { default: bootAuth } = await import('./auth');

    const bootResult = bootAuth({} as never);
    await vi.waitFor(() => expect(runPostActivationSyncMock).toHaveBeenCalledTimes(1));

    expect(bootResult).toBeUndefined();
    resolveSync?.();
    await flushBackgroundTasks();
  });

  test('starts sync for a persisted active user after verification', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = 'pro';

    const { default: bootAuth } = await import('./auth');

    bootAuth({} as never);
    await vi.waitFor(() => expect(runPostActivationSyncMock).toHaveBeenCalledTimes(1));

    expect(verifyUserMock).toHaveBeenCalledTimes(1);
    expect(useAutoSyncMock).toHaveBeenCalledTimes(1);
    expect(useAppResumeMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallOrder(useAutoSyncMock)).toBeLessThan(getFirstCallOrder(verifyUserMock));
    expect(getFirstCallOrder(useAppResumeMock)).toBeLessThan(getFirstCallOrder(verifyUserMock));
    expect(getFirstCallOrder(verifyUserMock)).toBeLessThan(
      getFirstCallOrder(runPostActivationSyncMock),
    );
  });

  test('does not start fallback sync when user becomes active during verification', async () => {
    activeBeforeVerify = undefined;
    activeAfterVerify = 'pro';

    const { default: bootAuth } = await import('./auth');

    bootAuth({} as never);
    await flushBackgroundTasks();

    expect(runPostActivationSyncMock).not.toHaveBeenCalled();
  });

  test('skips post-activation sync when offline', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = 'pro';
    vi.stubGlobal('navigator', { onLine: false });

    const { default: bootAuth } = await import('./auth');

    bootAuth({} as never);
    await flushBackgroundTasks();

    expect(runPostActivationSyncMock).not.toHaveBeenCalled();
  });

  test('does not start sync when verification leaves user inactive', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = undefined;

    const { default: bootAuth } = await import('./auth');

    bootAuth({} as never);
    await flushBackgroundTasks();

    expect(runPostActivationSyncMock).not.toHaveBeenCalled();
  });

  test('reports background authentication errors', async () => {
    const startupError = new Error('Authentication failed');
    verifyUserMock.mockRejectedValue(startupError);

    const { default: bootAuth } = await import('./auth');

    const bootResult = bootAuth({} as never);
    await vi.waitFor(() => expect(reportWarningMock).toHaveBeenCalledWith(startupError));

    expect(bootResult).toBeUndefined();
  });
});
