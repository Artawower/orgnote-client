import { expect, test, vi, beforeEach } from 'vitest';
import { ref, nextTick, type Ref } from 'vue';
import { useAutoSync, type UseAutoSyncDeps } from './use-auto-sync';

type User = { active?: string } | null | undefined;

const createUser = (active?: string): User => ({ active });

const flushWatchers = async () => {
  await nextTick();
  await nextTick();
  await new Promise((r) => setTimeout(r, 0));
};

let userRef: Ref<User>;
let syncMock: ReturnType<typeof vi.fn>;
let onErrorMock: ReturnType<typeof vi.fn>;
let deps: UseAutoSyncDeps;

beforeEach(() => {
  userRef = ref<User>(null);
  syncMock = vi.fn().mockResolvedValue(undefined);
  onErrorMock = vi.fn();
  deps = {
    userRef,
    sync: syncMock as UseAutoSyncDeps['sync'],
    onError: onErrorMock as UseAutoSyncDeps['onError'],
  };
});

test('useAutoSync: triggers sync when user becomes active', async () => {
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();

  expect(syncMock).toHaveBeenCalledTimes(1);
});

test('useAutoSync: triggers sync on transition from inactive to active', async () => {
  userRef.value = createUser(undefined);
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();

  expect(syncMock).toHaveBeenCalledTimes(1);
});

test('useAutoSync: does not trigger sync when user was already active', async () => {
  userRef.value = createUser('true');
  useAutoSync(deps);

  userRef.value = createUser('yes');
  await flushWatchers();

  expect(syncMock).not.toHaveBeenCalled();});

test('useAutoSync: does not trigger sync when user becomes inactive', async () => {
  useAutoSync(deps);

  userRef.value = createUser(undefined);
  await flushWatchers();

  expect(syncMock).not.toHaveBeenCalled();});

test('useAutoSync: does not trigger sync on logout', async () => {
  userRef.value = createUser('true');
  useAutoSync(deps);

  userRef.value = null;
  await flushWatchers();

  expect(syncMock).not.toHaveBeenCalled();});

test('useAutoSync: calls onError when sync fails', async () => {
  const error = new Error('Sync failed');
  syncMock.mockRejectedValueOnce(error);
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();

  expect(onErrorMock).toHaveBeenCalledWith(error);
});

test('useAutoSync: triggers sync on each transition to active state', async () => {
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();
  expect(syncMock).toHaveBeenCalledTimes(1);

  userRef.value = createUser(undefined);
  await flushWatchers();

  userRef.value = createUser('true');
  await flushWatchers();
  expect(syncMock).toHaveBeenCalledTimes(2);
});

test('useAutoSync: returns stop handle that stops watching', async () => {
  const stop = useAutoSync(deps);
  stop();

  userRef.value = createUser('true');
  await flushWatchers();

  expect(syncMock).not.toHaveBeenCalled();});
