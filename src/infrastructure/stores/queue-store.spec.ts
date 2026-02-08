import { test, expect, vi, type Mock } from 'vitest';
import { QueueStore } from './queue-store';
import type { QueueRepository, QueueTask } from 'orgnote-api';

const asMock = (fn: unknown): Mock => fn as Mock;

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

const createMockRepository = (): QueueRepository => ({
  add: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(undefined),
  getAll: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
  lock: vi.fn().mockResolvedValue(undefined),
  release: vi.fn().mockResolvedValue(undefined),
  takeFirstN: vi.fn().mockResolvedValue('lock-123'),
  getLock: vi.fn().mockResolvedValue(undefined),
  getRunningTasks: vi.fn().mockResolvedValue({}),
  clear: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
});

const createQueueTask = (overrides: Partial<QueueTask> = {}): QueueTask => ({
  id: 'task-1',
  payload: { data: 'test' },
  queueId: 'default',
  added: Date.now(),
  ...overrides,
});

test('QueueStore connect returns only pending task count', async () => {
  const repo = createMockRepository();
  const tasks = [
    createQueueTask({ id: 'task-1', status: 'pending' }),
    createQueueTask({ id: 'task-2', status: 'pending' }),
    createQueueTask({ id: 'task-3', status: 'processing' }),
    createQueueTask({ id: 'task-4', status: 'completed' }),
  ];
  asMock(repo.getAll).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.connect(cb);

  await flushPromises();
  expect(repo.getAll).toHaveBeenCalledWith('test-queue');
  expect(cb).toHaveBeenCalledWith(null, 2);
});

test('QueueStore connect returns 0 when no pending tasks', async () => {
  const repo = createMockRepository();
  const tasks = [
    createQueueTask({ id: 'task-1', status: 'processing' }),
    createQueueTask({ id: 'task-2', status: 'completed' }),
  ];
  asMock(repo.getAll).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.connect(cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, 0);
});

test('QueueStore connect calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.getAll).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.connect(cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error, 0);
});

test('QueueStore getTask returns undefined when task not found', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.getTask('non-existent', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, undefined);
});

test('QueueStore getTask returns full task from repository', async () => {
  const repo = createMockRepository();
  const task = createQueueTask({ id: 'task-1', payload: { data: 'test' } });
  asMock(repo.get).mockResolvedValue(task);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getTask('task-1', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, task);
});

test('QueueStore getTask calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.get).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getTask('task-1', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error);
});

test('QueueStore getAll returns tasks from repository', async () => {
  const repo = createMockRepository();
  const tasks = [createQueueTask({ id: 'task-1' }), createQueueTask({ id: 'task-2' })];
  asMock(repo.getAll).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getAll(cb);

  await flushPromises();
  expect(repo.getAll).toHaveBeenCalledWith('test-queue');
  expect(cb).toHaveBeenCalledWith(null, tasks);
});

test('QueueStore getAll calls callback with empty array on error', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.getAll).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getAll(cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error, []);
});

test('QueueStore putTask adds task with correct fields', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.putTask('task-1', { payload: { data: 'test' } }, 5, cb);

  await flushPromises();
  expect(repo.add).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 'task-1',
      payload: { data: 'test' },
      queueId: 'test-queue',
    }),
  );
  expect(cb).toHaveBeenCalledWith(null);
});

test('QueueStore putTask extracts payload from task object', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.putTask('task-1', { payload: { data: 'test' } }, 0, cb);

  await flushPromises();
  expect(repo.add).toHaveBeenCalledWith(
    expect.objectContaining({
      payload: { data: 'test' },
    }),
  );
});

test('QueueStore putTask calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.add).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.putTask('task-1', { payload: { data: 'test' } }, 0, cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error);
});

test('QueueStore putTask returns error for task without payload property', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.putTask('task-1', 'a-string' as unknown as { payload: unknown }, 0, cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(expect.objectContaining({
    message: expect.stringContaining('Invalid task shape'),
  }));
  expect(repo.add).not.toHaveBeenCalled();
});

test('QueueStore putTask returns error for undefined task', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.putTask('task-1', undefined, 0, cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(expect.objectContaining({
    message: expect.stringContaining('Invalid task shape'),
  }));
  expect(repo.add).not.toHaveBeenCalled();
});

test('QueueStore takeFirstN returns lockId from repository', async () => {
  const repo = createMockRepository();
  asMock(repo.takeFirstN).mockResolvedValue('lock-abc');

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.takeFirstN(5, cb);

  await flushPromises();
  expect(repo.takeFirstN).toHaveBeenCalledWith(5, 'test-queue');
  expect(cb).toHaveBeenCalledWith(null, 'lock-abc');
});

test('QueueStore takeFirstN returns empty string when no tasks available', async () => {
  const repo = createMockRepository();
  asMock(repo.takeFirstN).mockResolvedValue('');

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.takeFirstN(5, cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, '');
});

test('QueueStore takeFirstN calls callback with empty string on error', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.takeFirstN).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.takeFirstN(5, cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error, '');
});

test('QueueStore getLock returns empty object when no tasks locked', async () => {
  const repo = createMockRepository();
  asMock(repo.getLock).mockResolvedValue(undefined);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getLock('lock-123', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, {});
});

test('QueueStore getLock returns tasks from repository', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1', payload: { data: 'one' } }),
    'task-2': createQueueTask({ id: 'task-2', payload: { data: 'two' } }),
  };
  asMock(repo.getLock).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getLock('lock-123', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, tasks);
});

test('QueueStore getLock calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.getLock).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getLock('lock-123', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error, {});
});

test('QueueStore deleteTask calls repository delete', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.deleteTask('task-1', cb);

  await flushPromises();
  expect(repo.delete).toHaveBeenCalledWith('task-1');
  expect(cb).toHaveBeenCalledWith(null);
});

test('QueueStore deleteTask calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.delete).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.deleteTask('task-1', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error);
});

test('QueueStore releaseLock releases all tasks with lockId', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1' }),
    'task-2': createQueueTask({ id: 'task-2' }),
  };
  asMock(repo.getLock).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await flushPromises();
  expect(repo.release).toHaveBeenCalledWith('task-1');
  expect(repo.release).toHaveBeenCalledWith('task-2');
  expect(cb).toHaveBeenCalledWith(null);
});

test('QueueStore releaseLock calls callback with success when no tasks', async () => {
  const repo = createMockRepository();
  asMock(repo.getLock).mockResolvedValue(undefined);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null);
});

test('QueueStore releaseLock calls callback with error on getLock failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.getLock).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error);
});

test('QueueStore releaseLock calls callback with error on release failure', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1' }),
  };
  asMock(repo.getLock).mockResolvedValue(tasks);
  const error = new Error('Release error');
  asMock(repo.release).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error);
});

test('QueueStore getRunningTasks groups tasks by lockId', async () => {
  const repo = createMockRepository();
  const task1 = createQueueTask({ id: 'task-1', lockId: 'lock-abc', payload: { data: 'one' } });
  asMock(repo.getRunningTasks).mockResolvedValue({ 'task-1': task1 });

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getRunningTasks(cb);

  await flushPromises();
  expect(repo.getRunningTasks).toHaveBeenCalledWith('test-queue');
  expect(cb).toHaveBeenCalledWith(null, {
    'lock-abc': { 'task-1': task1 },
  });
});

test('QueueStore getRunningTasks groups multiple tasks by different lockIds', async () => {
  const repo = createMockRepository();
  const task1 = createQueueTask({ id: 'task-1', lockId: 'lock-a', payload: { data: 'one' } });
  const task2 = createQueueTask({ id: 'task-2', lockId: 'lock-a', payload: { data: 'two' } });
  const task3 = createQueueTask({ id: 'task-3', lockId: 'lock-b', payload: { data: 'three' } });
  asMock(repo.getRunningTasks).mockResolvedValue({ 'task-1': task1, 'task-2': task2, 'task-3': task3 });

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getRunningTasks(cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, {
    'lock-a': { 'task-1': task1, 'task-2': task2 },
    'lock-b': { 'task-3': task3 },
  });
});

test('QueueStore getRunningTasks skips tasks without lockId', async () => {
  const repo = createMockRepository();
  const task1 = createQueueTask({ id: 'task-1', lockId: 'lock-a', payload: { data: 'one' } });
  const task2 = createQueueTask({ id: 'task-2', lockId: undefined, payload: { data: 'two' } });
  asMock(repo.getRunningTasks).mockResolvedValue({ 'task-1': task1, 'task-2': task2 });

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getRunningTasks(cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(null, {
    'lock-a': { 'task-1': task1 },
  });
});

test('QueueStore getRunningTasks calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  asMock(repo.getRunningTasks).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getRunningTasks(cb);

  await flushPromises();
  expect(cb).toHaveBeenCalledWith(error, {});
});

test('QueueStore takeLastN returns empty lockId (not implemented)', () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.takeLastN(5, cb);

  expect(cb).toHaveBeenCalledWith(null, '');
});

test('QueueStore uses default queue name when not provided', () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo);

  const cb = vi.fn();
  store.getAll(cb);

  expect(repo.getAll).toHaveBeenCalledWith('default');
});

