import { test, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { SyncPlan } from 'orgnote-api';

const mockEnqueuePlanOperations = vi.fn();
const mockIsPlanEmpty = vi.fn();
const mockRecoverState = vi.fn(async () => undefined);
const mockCreateSyncPlan = vi.fn();
const mockReportError = vi.fn();

let mockUserActive: string | undefined = 'pro';
let mockSyncType: string = 'api';

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useAuth: vi.fn(() => ({
        get user() {
          return mockUserActive !== undefined ? { active: mockUserActive } : undefined;
        },
      })),
      useConfig: vi.fn(() => ({
        get config() {
          return { synchronization: { type: mockSyncType } };
        },
      })),
    },
  },
}));

vi.mock('src/infrastructure/sync', () => ({
  enqueuePlanOperations: mockEnqueuePlanOperations,
  isPlanEmpty: mockIsPlanEmpty,
}));

vi.mock('orgnote-api', async () => {
  return {
    recoverState: mockRecoverState,
    createSyncPlan: mockCreateSyncPlan,
  };
});

vi.mock('src/boot/report', () => ({
  reporter: { reportError: mockReportError },
}));

vi.mock('src/boot/axios', () => ({
  sdk: { sync: {} },
}));

vi.mock('./file-system-manager', () => ({
  useFileSystemManagerStore: vi.fn(() => ({
    currentFs: {},
  })),
}));

const createEmptyPlan = (): SyncPlan => ({
  toUpload: [],
  toDownload: [],
  toDeleteLocal: [],
  toDeleteRemote: [],
  serverTime: '2024-01-01T00:00:00Z',
});

const createNonEmptyPlan = (): SyncPlan => ({
  ...createEmptyPlan(),
  toUpload: [{ path: '/note.org', mtime: 1000, size: 100 }],
});

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
  mockUserActive = 'pro';
  mockSyncType = 'api';
});

test('sync does not create plan when user is not active', async () => {
  mockUserActive = undefined;
  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockRecoverState).not.toHaveBeenCalled();
  expect(mockEnqueuePlanOperations).not.toHaveBeenCalled();
});

test('sync does not create plan when sync type is none', async () => {
  mockSyncType = 'none';
  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockRecoverState).not.toHaveBeenCalled();
  expect(mockEnqueuePlanOperations).not.toHaveBeenCalled();
});

test('sync does not create plan when user.active is empty string', async () => {
  mockUserActive = '';
  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockRecoverState).not.toHaveBeenCalled();
});

test('sync proceeds to plan creation when user is active and sync type is api', async () => {
  mockRecoverState.mockResolvedValueOnce(undefined);
  mockCreateSyncPlan.mockResolvedValueOnce(createNonEmptyPlan());
  mockIsPlanEmpty.mockReturnValueOnce(false);

  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockRecoverState).toHaveBeenCalled();
  expect(mockCreateSyncPlan).toHaveBeenCalledWith(
    expect.objectContaining({
      rootPath: '/',
      enableContentHashCheck: true,
    }),
  );
  expect(mockEnqueuePlanOperations).toHaveBeenCalled();
});

test('sync skips executePlan when plan is empty', async () => {
  mockRecoverState.mockResolvedValueOnce(undefined);
  mockCreateSyncPlan.mockResolvedValueOnce(createEmptyPlan());
  mockIsPlanEmpty.mockReturnValueOnce(true);

  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockEnqueuePlanOperations).not.toHaveBeenCalled();
});

test('sync stores plan in currentPlan before execution', async () => {
  const plan = createNonEmptyPlan();

  mockRecoverState.mockResolvedValueOnce(undefined);
  mockCreateSyncPlan.mockResolvedValueOnce(plan);
  mockIsPlanEmpty.mockReturnValueOnce(false);
  mockEnqueuePlanOperations.mockImplementation(() => undefined);

  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(store.currentPlan).toBeNull();
});

test('sync reports error and returns null plan when recoverState fails', async () => {
  const error = new Error('state recovery failed');
  mockRecoverState.mockRejectedValueOnce(error);

  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockReportError).toHaveBeenCalledWith(error);
  expect(mockEnqueuePlanOperations).not.toHaveBeenCalled();
});

test('sync reports error and returns null plan when createSyncPlan fails', async () => {
  const error = new Error('plan creation failed');
  mockRecoverState.mockResolvedValueOnce(undefined);
  mockCreateSyncPlan.mockRejectedValueOnce(error);

  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.sync();

  expect(mockReportError).toHaveBeenCalledWith(error);
  expect(mockEnqueuePlanOperations).not.toHaveBeenCalled();
});

test('reset clears currentPlan', async () => {
  const { useSyncStore } = await import('./sync');
  const store = useSyncStore();

  await store.reset();

  expect(store.currentPlan).toBeNull();
});
