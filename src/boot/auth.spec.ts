import { beforeEach, describe, expect, test, vi } from 'vitest';

const useAutoSyncMock = vi.fn();
const useAppResumeMock = vi.fn();
const verifyUserMock = vi.fn();
const syncMock = vi.fn();

let activeBeforeVerify: string | undefined;
let activeAfterVerify: string | undefined;

vi.mock('@quasar/app-vite/wrappers', () => ({
  defineBoot: (bootFn: unknown) => bootFn,
}));

vi.mock('src/composables/use-auto-sync', () => ({
  useAutoSync: useAutoSyncMock,
}));

vi.mock('src/composables/use-app-resume', () => ({
  useAppResume: useAppResumeMock,
}));

vi.mock('./api', () => ({
  api: {
    core: {
      useAuth: () => ({
        get user() {
          return activeBeforeVerify || activeAfterVerify
            ? { active: activeBeforeVerify }
            : null;
        },
        verifyUser: verifyUserMock,
      }),
      useSync: () => ({
        sync: syncMock,
      }),
    },
  },
}));

describe('auth boot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeBeforeVerify = undefined;
    activeAfterVerify = undefined;

    verifyUserMock.mockImplementation(async () => {
      activeBeforeVerify = activeAfterVerify;
    });
    syncMock.mockResolvedValue(undefined);
  });

  test('starts sync on boot when persisted user is already active', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = 'pro';

    const { default: bootAuth } = await import('./auth');

    await bootAuth({} as never);

    expect(useAutoSyncMock).toHaveBeenCalledTimes(1);
    expect(useAppResumeMock).toHaveBeenCalledTimes(1);
    expect(verifyUserMock).toHaveBeenCalledTimes(1);
    expect(syncMock).toHaveBeenCalledTimes(1);
  });

  test('does not start extra sync when user becomes active during verify', async () => {
    activeBeforeVerify = undefined;
    activeAfterVerify = 'pro';

    const { default: bootAuth } = await import('./auth');

    await bootAuth({} as never);

    expect(syncMock).not.toHaveBeenCalled();
  });

  test('does not start sync when verification leaves user inactive', async () => {
    activeBeforeVerify = 'pro';
    activeAfterVerify = undefined;

    const { default: bootAuth } = await import('./auth');

    await bootAuth({} as never);

    expect(syncMock).not.toHaveBeenCalled();
  });
});
