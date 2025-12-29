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
let sync: ReturnType<typeof vi.fn>;
let onError: ReturnType<typeof vi.fn>;
let deps: UseAutoSyncDeps;

beforeEach(() => {
  userRef = ref<User>(null);
  sync = vi.fn().mockResolvedValue(undefined);
  onError = vi.fn();
  deps = { userRef, sync, onError };
});

test('useAutoSync: triggers sync when user becomes active', async () => {
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();

  expect(sync).toHaveBeenCalledTimes(1);
});

test('useAutoSync: triggers sync on transition from inactive to active', async () => {
  userRef.value = createUser(undefined);
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();

  expect(sync).toHaveBeenCalledTimes(1);
});

test('useAutoSync: does not trigger sync when user was already active', async () => {
  userRef.value = createUser('true');
  useAutoSync(deps);

  userRef.value = createUser('yes');
  await flushWatchers();

  expect(sync).not.toHaveBeenCalled();
});

test('useAutoSync: does not trigger sync when user becomes inactive', async () => {
  useAutoSync(deps);

  userRef.value = createUser(undefined);
  await flushWatchers();

  expect(sync).not.toHaveBeenCalled();
});

test('useAutoSync: does not trigger sync on logout', async () => {
  userRef.value = createUser('true');
  useAutoSync(deps);

  userRef.value = null;
  await flushWatchers();

  expect(sync).not.toHaveBeenCalled();
});

test('useAutoSync: calls onError when sync fails', async () => {
  const error = new Error('Sync failed');
  sync.mockRejectedValueOnce(error);
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();

  expect(onError).toHaveBeenCalledWith(error);
});

test('useAutoSync: triggers sync on each transition to active state', async () => {
  useAutoSync(deps);

  userRef.value = createUser('true');
  await flushWatchers();
  expect(sync).toHaveBeenCalledTimes(1);

  userRef.value = createUser(undefined);
  await flushWatchers();

  userRef.value = createUser('true');
  await flushWatchers();
  expect(sync).toHaveBeenCalledTimes(2);
});

test('useAutoSync: returns stop handle that stops watching', async () => {
  const stop = useAutoSync(deps);
  stop();

  userRef.value = createUser('true');
  await flushWatchers();

  expect(sync).not.toHaveBeenCalled();
});
