import { test, expect, vi } from 'vitest';
import { QueueStore } from './queue-store';
import type { QueueRepository, QueueTask } from 'orgnote-api';

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
  vi.mocked(repo.getAll).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.connect(cb);

  await vi.waitFor(() => {
    expect(repo.getAll).toHaveBeenCalledWith('test-queue');
    expect(cb).toHaveBeenCalledWith(null, 2);
  });
});

test('QueueStore connect returns 0 when no pending tasks', async () => {
  const repo = createMockRepository();
  const tasks = [
    createQueueTask({ id: 'task-1', status: 'processing' }),
    createQueueTask({ id: 'task-2', status: 'completed' }),
  ];
  vi.mocked(repo.getAll).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.connect(cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null, 0);
  });
});

test('QueueStore connect calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.getAll).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.connect(cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error, 0);
  });
});

test('QueueStore getTask returns undefined when task not found', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.getTask('non-existent', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null, undefined);
  });
});

test('QueueStore getTask returns full task from repository', async () => {
  const repo = createMockRepository();
  const task = createQueueTask({ id: 'task-1', payload: { data: 'test' } });
  vi.mocked(repo.get).mockResolvedValue(task);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getTask('task-1', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null, task);
  });
});

test('QueueStore getTask calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.get).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getTask('task-1', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error);
  });
});

test('QueueStore getAll returns tasks from repository', async () => {
  const repo = createMockRepository();
  const tasks = [createQueueTask({ id: 'task-1' }), createQueueTask({ id: 'task-2' })];
  vi.mocked(repo.getAll).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getAll(cb);

  await vi.waitFor(() => {
    expect(repo.getAll).toHaveBeenCalledWith('test-queue');
    expect(cb).toHaveBeenCalledWith(null, tasks);
  });
});

test('QueueStore getAll calls callback with empty array on error', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.getAll).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getAll(cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error, []);
  });
});

test('QueueStore putTask adds task with correct fields', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.putTask('task-1', { payload: { data: 'test' } }, 5, cb);

  await vi.waitFor(() => {
    expect(repo.add).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-1',
        payload: { data: 'test' },
        queueId: 'test-queue',
      }),
    );
    expect(cb).toHaveBeenCalledWith(null);
  });
});

test('QueueStore putTask extracts payload from task object', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.putTask('task-1', { payload: { data: 'test' } }, 0, cb);

  await vi.waitFor(() => {
    expect(repo.add).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { data: 'test' },
      }),
    );
  });
});

test('QueueStore putTask calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.add).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.putTask('task-1', { payload: { data: 'test' } }, 0, cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error);
  });
});

test('QueueStore takeFirstN returns lockId from repository', async () => {
  const repo = createMockRepository();
  vi.mocked(repo.takeFirstN).mockResolvedValue('lock-abc');

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.takeFirstN(5, cb);

  await vi.waitFor(() => {
    expect(repo.takeFirstN).toHaveBeenCalledWith(5, 'test-queue');
    expect(cb).toHaveBeenCalledWith(null, 'lock-abc');
  });
});

test('QueueStore takeFirstN returns empty string when no tasks available', async () => {
  const repo = createMockRepository();
  vi.mocked(repo.takeFirstN).mockResolvedValue('');

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.takeFirstN(5, cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null, '');
  });
});

test('QueueStore takeFirstN calls callback with empty string on error', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.takeFirstN).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.takeFirstN(5, cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error, '');
  });
});

test('QueueStore getLock returns empty object when no tasks locked', async () => {
  const repo = createMockRepository();
  vi.mocked(repo.getLock).mockResolvedValue(undefined);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null, {});
  });
});

test('QueueStore getLock returns full tasks from repository', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1', payload: { data: 'one' } }),
    'task-2': createQueueTask({ id: 'task-2', payload: { data: 'two' } }),
  };
  vi.mocked(repo.getLock).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null, tasks);
  });
});

test('QueueStore getLock calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.getLock).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error, {});
  });
});

test('QueueStore deleteTask calls repository delete', async () => {
  const repo = createMockRepository();
  const store = new QueueStore(repo, 'test-queue');

  const cb = vi.fn();
  store.deleteTask('task-1', cb);

  await vi.waitFor(() => {
    expect(repo.delete).toHaveBeenCalledWith('task-1');
    expect(cb).toHaveBeenCalledWith(null);
  });
});

test('QueueStore deleteTask calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.delete).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.deleteTask('task-1', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error);
  });
});

test('QueueStore releaseLock releases all tasks with lockId', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1' }),
    'task-2': createQueueTask({ id: 'task-2' }),
  };
  vi.mocked(repo.getLock).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(repo.release).toHaveBeenCalledWith('task-1');
    expect(repo.release).toHaveBeenCalledWith('task-2');
    expect(cb).toHaveBeenCalledWith(null);
  });
});

test('QueueStore releaseLock calls callback with success when no tasks', async () => {
  const repo = createMockRepository();
  vi.mocked(repo.getLock).mockResolvedValue(undefined);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(null);
  });
});

test('QueueStore releaseLock calls callback with error on getLock failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.getLock).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error);
  });
});

test('QueueStore releaseLock calls callback with error on release failure', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1' }),
  };
  vi.mocked(repo.getLock).mockResolvedValue(tasks);
  const error = new Error('Release error');
  vi.mocked(repo.release).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.releaseLock('lock-123', cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error);
  });
});

test('QueueStore getRunningTasks returns tasks from repository', async () => {
  const repo = createMockRepository();
  const tasks = {
    'task-1': createQueueTask({ id: 'task-1', payload: { data: 'one' } }),
  };
  vi.mocked(repo.getRunningTasks).mockResolvedValue(tasks);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getRunningTasks(cb);

  await vi.waitFor(() => {
    expect(repo.getRunningTasks).toHaveBeenCalledWith('test-queue');
    expect(cb).toHaveBeenCalledWith(null, tasks);
  });
});

test('QueueStore getRunningTasks calls callback with error on failure', async () => {
  const repo = createMockRepository();
  const error = new Error('DB error');
  vi.mocked(repo.getRunningTasks).mockRejectedValue(error);

  const store = new QueueStore(repo, 'test-queue');
  const cb = vi.fn();
  store.getRunningTasks(cb);

  await vi.waitFor(() => {
    expect(cb).toHaveBeenCalledWith(error, {});
  });
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

