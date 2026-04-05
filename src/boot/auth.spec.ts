import { beforeEach, describe, expect, test, vi } from 'vitest';

const useAutoSyncMock = vi.fn();
const useAppResumeMock = vi.fn();
const verifyUserMock = vi.fn();
const runPostActivationSyncMock = vi.fn();

let activeBeforeVerify: string | undefined;
let activeAfterVerify: string | undefined;
let hasVerifiedUser: boolean;

const getFirstCallOrder = (mock: ReturnType<typeof vi.fn>): number => {
  return mock.mock.invocationCallOrder[0] ?? 0;
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

    verifyUserMock.mockImplementation(async () => {
      hasVerifiedUser = true;
    });
    runPostActivationSyncMock.mockResolvedValue(undefined);
  });

  test('starts sync on boot when persisted user is already active', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = 'pro';

    const { default: bootAuth } = await import('./auth');

    await bootAuth({} as never);

    expect(verifyUserMock).toHaveBeenCalledTimes(1);
    expect(useAutoSyncMock).toHaveBeenCalledTimes(1);
    expect(useAppResumeMock).toHaveBeenCalledTimes(1);
    expect(runPostActivationSyncMock).toHaveBeenCalledTimes(1);
    expect(getFirstCallOrder(useAutoSyncMock)).toBeLessThan(getFirstCallOrder(verifyUserMock));
    expect(getFirstCallOrder(useAppResumeMock)).toBeLessThan(getFirstCallOrder(verifyUserMock));
    expect(getFirstCallOrder(verifyUserMock)).toBeLessThan(
      getFirstCallOrder(runPostActivationSyncMock),
    );
  });

  test('does not start fallback sync when user becomes active during verify', async () => {
    activeBeforeVerify = undefined;
    activeAfterVerify = 'pro';

    const { default: bootAuth } = await import('./auth');

    await bootAuth({} as never);

    expect(runPostActivationSyncMock).not.toHaveBeenCalled();
  });

  test('does not start sync when verification leaves user inactive', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = undefined;

    const { default: bootAuth } = await import('./auth');

    await bootAuth({} as never);

    expect(runPostActivationSyncMock).not.toHaveBeenCalled();
  });
});
