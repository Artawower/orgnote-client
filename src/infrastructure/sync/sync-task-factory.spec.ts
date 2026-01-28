import { test, expect, vi, beforeEach } from 'vitest';
import type { SyncPlan, LocalFile, RemoteFile } from 'orgnote-api';
import { SyncOperationType } from 'orgnote-api';
import { isPlanEmpty, enqueuePlanOperations } from './sync-task-factory';

const mockAdd = vi.fn();

vi.mock('src/stores/queue', () => ({
  useQueueStore: () => ({
    add: mockAdd,
  }),
}));

const createEmptyPlan = (): SyncPlan => ({
  toUpload: [],
  toDownload: [],
  toDeleteLocal: [],
  toDeleteRemote: [],
  serverTime: '2024-01-01T00:00:00Z',
});

const createLocalFile = (path: string): LocalFile => ({
  path,
  mtime: 1000,
  size: 100,
});

const createRemoteFile = (path: string): RemoteFile => ({
  path,
  version: 1,
  deleted: false,
  updatedAt: '2024-01-01T00:00:00Z',
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('isPlanEmpty returns true for empty plan', () => {
  const plan = createEmptyPlan();
  expect(isPlanEmpty(plan)).toBe(true);
});

test('isPlanEmpty returns false when toUpload has items', () => {
  const plan = createEmptyPlan();
  plan.toUpload = [createLocalFile('/test.org')];
  expect(isPlanEmpty(plan)).toBe(false);
});

test('isPlanEmpty returns false when toDownload has items', () => {
  const plan = createEmptyPlan();
  plan.toDownload = [createRemoteFile('/test.org')];
  expect(isPlanEmpty(plan)).toBe(false);
});

test('isPlanEmpty returns false when toDeleteLocal has items', () => {
  const plan = createEmptyPlan();
  plan.toDeleteLocal = ['/test.org'];
  expect(isPlanEmpty(plan)).toBe(false);
});

test('isPlanEmpty returns false when toDeleteRemote has items', () => {
  const plan = createEmptyPlan();
  plan.toDeleteRemote = ['/test.org'];
  expect(isPlanEmpty(plan)).toBe(false);
});

test('enqueuePlanOperations returns 0 for empty plan', () => {
  const plan = createEmptyPlan();

  const count = enqueuePlanOperations(plan);

  expect(count).toBe(0);
  expect(mockAdd).not.toHaveBeenCalled();
});

test('enqueuePlanOperations enqueues upload tasks', () => {
  const plan = createEmptyPlan();
  plan.toUpload = [createLocalFile('/file1.org'), createLocalFile('/file2.org')];

  const count = enqueuePlanOperations(plan);

  expect(count).toBe(2);
  expect(mockAdd).toHaveBeenCalledTimes(2);
  expect(mockAdd).toHaveBeenCalledWith(
    'sync',
    expect.objectContaining({ type: SyncOperationType.Upload, data: plan.toUpload[0] }),
  );
});

test('enqueuePlanOperations enqueues download tasks', () => {
  const plan = createEmptyPlan();
  plan.toDownload = [createRemoteFile('/file1.org')];

  const count = enqueuePlanOperations(plan);

  expect(count).toBe(1);
  expect(mockAdd).toHaveBeenCalledWith(
    'sync',
    expect.objectContaining({ type: SyncOperationType.Download, data: plan.toDownload[0] }),
  );
});

test('enqueuePlanOperations enqueues deleteLocal tasks', () => {
  const plan = createEmptyPlan();
  plan.toDeleteLocal = ['/file1.org', '/file2.org'];

  const count = enqueuePlanOperations(plan);

  expect(count).toBe(2);
  expect(mockAdd).toHaveBeenCalledWith(
    'sync',
    expect.objectContaining({ type: SyncOperationType.DeleteLocal, data: '/file1.org' }),
  );
});

test('enqueuePlanOperations enqueues deleteRemote tasks', () => {
  const plan = createEmptyPlan();
  plan.toDeleteRemote = ['/file1.org'];

  const count = enqueuePlanOperations(plan);

  expect(count).toBe(1);
  expect(mockAdd).toHaveBeenCalledWith(
    'sync',
    expect.objectContaining({ type: SyncOperationType.DeleteRemote, data: '/file1.org' }),
  );
});

test('enqueuePlanOperations enqueues mixed operations', () => {
  const plan = createEmptyPlan();
  plan.toUpload = [createLocalFile('/upload.org')];
  plan.toDownload = [createRemoteFile('/download.org')];
  plan.toDeleteLocal = ['/delete-local.org'];
  plan.toDeleteRemote = ['/delete-remote.org'];

  const count = enqueuePlanOperations(plan);

  expect(count).toBe(4);
  expect(mockAdd).toHaveBeenCalledTimes(4);
});

test('enqueuePlanOperations includes serverTime in each task', () => {
  const plan = createEmptyPlan();
  plan.serverTime = '2024-06-15T12:00:00Z';
  plan.toUpload = [createLocalFile('/file.org')];

  enqueuePlanOperations(plan);

  expect(mockAdd).toHaveBeenCalledWith(
    'sync',
    expect.objectContaining({ serverTime: '2024-06-15T12:00:00Z' }),
  );
});
