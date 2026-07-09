import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const mockKvGet = vi.fn();
const mockKvSet = vi.fn();
const mockKvDelete = vi.fn();
const mockFileRead = vi.fn();
const mockFileWrite = vi.fn();
const mockGetExtensionConfig = vi.fn(() => ({ value: {} as Record<string, unknown> }));

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useFileContent: () => ({ read: mockFileRead, write: mockFileWrite }),
      useExtensions: () => ({ getExtensionConfig: mockGetExtensionConfig }),
      useNotifications: () => ({ notify: vi.fn() }),
    },
    infrastructure: {
      keyValueRepository: { get: mockKvGet, set: mockKvSet, delete: mockKvDelete },
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: { reportError: vi.fn() },
}));

vi.mock('src/boot/i18n', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

vi.mock('src/extensions/org-agenda/manifest', () => ({
  orgAgendaManifest: { name: 'org-agenda' },
}));

vi.mock('src/extensions/org-agenda/mutations/clock', () => ({
  appendClock: vi.fn((content: string) => content),
}));

vi.stubGlobal(
  'AudioContext',
  class {
    createOscillator() {
      return { connect: vi.fn(), frequency: { value: 0 }, start: vi.fn(), stop: vi.fn() };
    }
    createGain() {
      return {
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      };
    }
    get currentTime() {
      return 0;
    }
    destination = {};
  },
);

const { usePomodoroStore } = await import('./pomodoro-store');
const { POMODORO_ACTIVE_SESSION_KEY } = await import('../constants');

const TASK = {
  id: 't1',
  text: 'Test task',
  filePath: '/test.org',
  start: 0,
  end: 100,
  kind: 'headline-todo' as const,
  state: 'todo' as const,
};

const mockUint8 = new Uint8Array([104, 101, 108, 108, 111]);

beforeEach(() => {
  setActivePinia(createPinia());
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockKvGet.mockResolvedValue(null);
  mockKvSet.mockResolvedValue(undefined);
  mockKvDelete.mockResolvedValue(undefined);
  mockFileRead.mockResolvedValue(mockUint8);
  mockFileWrite.mockResolvedValue(undefined);
  mockGetExtensionConfig.mockReturnValue({ value: {} });
});

afterEach(() => {
  vi.useRealTimers();
});

const tickSec = (seconds: number): void => {
  vi.advanceTimersByTime(seconds * 1000);
};

const getActiveSessionPayload = (): string => {
  const activeCall = mockKvSet.mock.calls.find(
    ([key]) => key === POMODORO_ACTIVE_SESSION_KEY,
  ) as [string, string] | undefined;
  if (!activeCall) throw new Error('active session payload missing');
  return activeCall[1];
};

test('pauseSession_setsIsPaused_true', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');

  await store.pauseSession();

  expect(store.isPaused).toBe(true);
});

test('pauseSession_writesClockEntry', async () => {
  const { appendClock } = await import('../mutations/clock');
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');

  await store.pauseSession();

  expect(vi.mocked(appendClock)).toHaveBeenCalledOnce();
});

test('pauseSession_stopsElapsed_afterPause', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');

  tickSec(10);
  expect(store.elapsed).toBe(10);

  await store.pauseSession();
  const frozen = store.elapsed;

  tickSec(5);

  expect(store.elapsed).toBe(frozen);
});

test('resumeSession_afterPause_continuesElapsed', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');

  tickSec(10);
  await store.pauseSession();
  const elapsedAtPause = store.elapsed;

  tickSec(5);

  await store.resumeSession();
  tickSec(3);

  expect(store.elapsed).toBeGreaterThan(elapsedAtPause);
  expect(store.isPaused).toBe(false);
});

test('pauseSession_accumulatesSeconds_acrossSegments', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');

  tickSec(10);
  await store.pauseSession();

  await store.resumeSession();
  tickSec(5);

  expect(store.elapsed).toBeGreaterThanOrEqual(15);
});

test('restoreSession_running_noDuplicateInterval_afterPause', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');

  tickSec(5);
  expect(store.elapsed).toBe(5);

  const kvSnapshot = (mockKvSet.mock.calls.at(-1) as [string, string])[1];
  mockKvGet.mockResolvedValue(kvSnapshot);

  await store.restoreSession();

  await store.pauseSession();
  const frozen = store.elapsed;

  tickSec(5);

  expect(store.elapsed).toBe(frozen);
});

test('stopSession_resetsSessionBeforeClockWriteFinishes', async () => {
  let resolveRead: ((value: Uint8Array) => void) | undefined;
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');
  mockKvGet.mockResolvedValue(getActiveSessionPayload());
  mockFileRead.mockReturnValueOnce(
    new Promise<Uint8Array>((resolve) => {
      resolveRead = resolve;
    }),
  );

  const stopPromise = store.stopSession();

  expect(store.hasSession).toBe(false);
  expect(store.elapsed).toBe(0);
  if (!resolveRead) throw new Error('read resolver missing');
  resolveRead(mockUint8);
  await stopPromise;
});

test('stopSession_clearsPersistedSession_whenStoredSessionMatches', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');
  mockKvGet.mockResolvedValue(getActiveSessionPayload());

  await store.stopSession();

  expect(mockKvDelete).toHaveBeenCalledWith(POMODORO_ACTIVE_SESSION_KEY);
});

test('stopSession_keepsNewSessionStartedDuringClockWrite', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');
  mockKvGet.mockResolvedValue(getActiveSessionPayload());
  mockFileRead.mockImplementationOnce(async () => {
    await store.startSession({ ...TASK, id: 't2', text: 'Next task' }, 'pomo');
    return mockUint8;
  });

  await store.stopSession();

  expect(mockKvDelete).not.toHaveBeenCalledWith(POMODORO_ACTIVE_SESSION_KEY);
  expect(store.session?.taskId).toBe('t2');
});

test('stopSession_whenPaused_doesNotWriteExtraClock', async () => {
  const { appendClock } = await import('../mutations/clock');
  const store = usePomodoroStore();

  await store.startSession(TASK, 'pomo');
  tickSec(5);

  await store.pauseSession();
  const clockCallsAfterPause = vi.mocked(appendClock).mock.calls.length;

  await store.stopSession();

  expect(vi.mocked(appendClock).mock.calls.length).toBe(clockCallsAfterPause);
});

test('restoreSession_paused_doesNotStartTick', async () => {
  const store = usePomodoroStore();
  await store.startSession(TASK, 'pomo');
  tickSec(10);
  await store.pauseSession();

  const pausedKv = (mockKvSet.mock.calls.at(-1) as [string, string])[1];
  mockKvGet.mockResolvedValue(pausedKv);
  setActivePinia(createPinia());
  const freshStore = usePomodoroStore();

  await freshStore.restoreSession();
  const frozen = freshStore.elapsed;

  tickSec(5);

  expect(freshStore.elapsed).toBe(frozen);
  expect(freshStore.isPaused).toBe(true);
});

test('restoreSession_corruptJson_doesNotThrowAndClearsKv', async () => {
  mockKvGet.mockResolvedValue('{invalid json{');
  const store = usePomodoroStore();

  await expect(store.restoreSession()).resolves.not.toThrow();
  expect(store.hasSession).toBe(false);
  expect(mockKvDelete).toHaveBeenCalled();
});

test('loadLastTask_corruptJson_returnsNull', async () => {
  mockKvGet.mockResolvedValue('{invalid json{');
  const store = usePomodoroStore();

  const result = await store.loadLastTask();

  expect(result).toBeNull();
});

test('durationMin_initializesFromAgendaConfig_pomoDuration', () => {
  mockGetExtensionConfig.mockReturnValue({ value: { pomoDuration: 42 } });
  const store = usePomodoroStore();

  expect(store.durationMin).toBe(42);
});
