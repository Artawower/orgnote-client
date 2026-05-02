import { defineStore } from 'pinia';
import { ref } from 'vue';
import Queue from 'better-queue';
import type { QueueOptions } from 'better-queue';
import { repositories } from 'src/boot/repositories';
import { QueueStore as BetterQueueStoreAdapter } from 'src/infrastructure/stores/queue-store';
import type {
  QueueTask,
  QueueStore,
  QueueCreationOptions,
  QueueTaskOptions,
  QueueStats,
  DeduplicationStrategy,
} from 'orgnote-api';
import { logger } from 'src/boot/logger';

const DEFAULT_DEDUPLICATION_STRATEGY: DeduplicationStrategy = 'replace';

const createProcessFn = (options: QueueCreationOptions) => {
  return options.process ?? ((_task: unknown, cb: (err?: unknown) => void) => cb());
};

const updateQueueStatus = (taskId: string, status: QueueTask['status']): void => {
  void repositories.queueRepository.update(taskId, { status }).catch((error: unknown) => {
    logger.error('Failed to update queue task status', { error, status, taskId });
  });
};

const registerQueueEvents = (queue: Queue) => {
  queue.on('task_finish', (taskId: string) => updateQueueStatus(taskId, 'completed'));
  queue.on('task_failed', (taskId: string) => updateQueueStatus(taskId, 'failed'));
};

type DeduplicationHandler = (existing: QueueTask) => Promise<string>;

const createDeduplicationHandlers = (
  queueId: string,
): Record<DeduplicationStrategy, DeduplicationHandler> => ({
  skip: async (existing) => {
    logger.debug(`Task ${existing.id} already exists in queue ${queueId}, skipping`);
    return existing.id;
  },

  replace: async (existing) => {
    logger.debug(`Task ${existing.id} already exists in queue ${queueId}, replacing`);
    await repositories.queueRepository.delete(existing.id, true);
    return '';
  },

  moveToEnd: async (existing) => {
    logger.debug(`Task ${existing.id} already exists in queue ${queueId}, moving to end`);
    const newPriority = Date.now();
    await repositories.queueRepository.update(existing.id, {
      priority: newPriority,
      added: newPriority,
    });
    return existing.id;
  },
});

export const useQueueStore = defineStore<'queue', QueueStore>('queue', () => {
  const queues = ref<Map<string, Queue>>(new Map());
  const queueConfigs = ref<Map<string, QueueCreationOptions>>(new Map());
  const queueIds = ref<string[]>([]);

  const addQueueId = (queueId: string) => {
    if (queueIds.value.includes(queueId)) return;
    queueIds.value = [...queueIds.value, queueId];
  };

  const removeQueueId = (queueId: string) => {
    queueIds.value = queueIds.value.filter((id) => id !== queueId);
  };

  const getQueue = (queueId: string): Queue | undefined => {
    return queues.value.get(queueId);
  };

  const getQueueOptions = (queueId: string): QueueCreationOptions => {
    return queueConfigs.value.get(queueId) ?? {};
  };

  const register = (queueId: string, options: QueueCreationOptions = {}): Queue => {
    const existingQueue = queues.value.get(queueId);
    if (existingQueue) {
      addQueueId(queueId);
      return existingQueue;
    }

    const storeAdapter = new BetterQueueStoreAdapter(repositories.queueRepository, queueId);
    const processFn = createProcessFn(options);

    const queueOptions: Partial<QueueOptions<unknown, unknown>> = {
      ...options,
      store: storeAdapter,
      id: 'id' as keyof unknown,
    };

    const queue = new Queue(processFn, queueOptions);

    registerQueueEvents(queue);
    queues.value.set(queueId, queue);
    queueConfigs.value.set(queueId, options);
    addQueueId(queueId);

    return queue;
  };

  const ensureQueue = (queueId: string): Queue => {
    const queue = getQueue(queueId);
    if (queue) {
      return queue;
    }
    return register(queueId);
  };

  const handleDeduplication = async (id: string, queueId: string): Promise<string | null> => {
    const existing = await repositories.queueRepository.get(id);

    if (!existing || existing.queueId !== queueId || existing.deletedAt) return null;

    const config = getQueueOptions(queueId);
    const strategy = config.deduplicationStrategy ?? DEFAULT_DEDUPLICATION_STRATEGY;

    const handlers = createDeduplicationHandlers(queueId);
    const handler = handlers[strategy];

    return await handler(existing);
  };

  const add = (queueId: string, payload: unknown, options?: QueueTaskOptions): Promise<string> => {
    return (async () => {
      const queue = ensureQueue(queueId);
      const id = options?.id ?? crypto.randomUUID();

      const existingTaskId = await handleDeduplication(id, queueId);
      if (existingTaskId) {
        return existingTaskId;
      }
      queue.push({ id, payload });
      return id;
    })();
  };

  const get = (taskId: string): Promise<QueueTask | undefined> => {
    return repositories.queueRepository.get(taskId);
  };

  const getAll = (queueId: string): Promise<QueueTask[]> => {
    return repositories.queueRepository.getAll(queueId);
  };

  const cancel = (queueId: string, taskId: string): Promise<void> => {
    return new Promise((resolve) => {
      ensureQueue(queueId).cancel(taskId, () => resolve());
    });
  };

  const remove = cancel;

  const pause = (queueId: string): void => {
    ensureQueue(queueId).pause();
  };

  const resume = (queueId: string): void => {
    ensureQueue(queueId).resume();
  };

  const destroy = (queueId: string): void => {
    const queue = getQueue(queueId);
    if (!queue) {
      return;
    }
    queue.removeAllListeners();
    queue.destroy(() => null);
    queues.value.delete(queueId);
    queueConfigs.value.delete(queueId);
    removeQueueId(queueId);
  };

  const unregister = (queueId: string): void => {
    destroy(queueId);
  };

  const clear = async (queueId: string): Promise<void> => {
    await pauseQueue(queueId);
    await repositories.queueRepository.clear(queueId);
    const queue = getQueue(queueId);
    if (queue) {
      queue.resume();
    }
  };

  const pauseQueue = async (queueId: string): Promise<void> => {
    const queue = getQueue(queueId);
    if (!queue) {
      return;
    }

    logger.warn(`PAUSE QUEUE: ${queueId}`);

    queue.pause();
    const tasks = await repositories.queueRepository.getAll(queueId);
    await Promise.all(
      tasks
        .filter((t) => t.status === 'pending' || t.status === 'processing')
        .map((t) => new Promise<void>((resolve) => queue.cancel(t.id, () => resolve()))),
    );
  };

  const getStats = (queueId: string): Promise<QueueStats> => {
    const stats = ensureQueue(queueId).getStats();
    return Promise.resolve({ ...stats });
  };

  const executeBatchTasks = <T = unknown[], R = unknown[]>(
    options: QueueCreationOptions,
    data: T[],
  ): Promise<R> => {
    if (!Array.isArray(data) || data.length === 0) {
      return Promise.resolve([] as R);
    }

    const originalProcess = options.process;
    if (!originalProcess) {
      return Promise.reject(new Error('process function is required in options'));
    }

    const queueId = `batch-${crypto.randomUUID()}`;
    const { promise, resolve, reject } = Promise.withResolvers<R>();

    const state = createBatchState<R>(data.length, resolve, reject);
    const queue = createBatchQueue(queueId, options, originalProcess, state);

    setupBatchEventHandlers(queue, queueId, state);
    enqueueBatchItems(queue, data);

    return promise;
  };

  const createBatchState = <R>(
    totalTasks: number,
    resolve: (value: R) => void,
    reject: (reason?: unknown) => void,
  ) => ({
    results: [] as unknown[],
    completedCount: 0,
    hasError: false,
    totalTasks,
    resolve,
    reject,
  });

  type BatchState<R> = ReturnType<typeof createBatchState<R>>;

  const createBatchQueue = <R>(
    queueId: string,
    options: QueueCreationOptions,
    originalProcess: NonNullable<QueueCreationOptions['process']>,
    state: BatchState<R>,
  ): Queue => {
    destroy(queueId);

    const wrappedProcess = (task: unknown, cb: (err?: unknown, result?: unknown) => void) => {
      if (state.hasError) {
        cb();
        return;
      }
      originalProcess(task, cb);
    };

    return register(queueId, { ...options, process: wrappedProcess });
  };

  const setupBatchEventHandlers = <R>(
    queue: Queue,
    queueId: string,
    state: BatchState<R>,
  ): void => {
    const cleanup = () => {
      queue.pause();
      queue.removeListener('task_finish', onTaskFinish);
      queue.removeListener('task_failed', onTaskFailed);
      queue.removeAllListeners();
      destroy(queueId);
      void repositories.queueRepository.clear(queueId);
    };

    const onTaskFinish = (_taskId: string, result: unknown) => {
      if (state.hasError) {
        return;
      }
      state.results.push(result);
      state.completedCount++;

      if (state.completedCount === state.totalTasks) {
        cleanup();
        state.resolve(state.results as R);
      }
    };

    const onTaskFailed = (_taskId: string, err: unknown) => {
      if (state.hasError) {
        return;
      }
      state.hasError = true;
      cleanup();
      state.reject(err);
    };

    queue.on('task_finish', onTaskFinish);
    queue.on('task_failed', onTaskFailed);
  };

  const enqueueBatchItems = <T>(queue: Queue, data: T[]): void => {
    data.forEach((item) => {
      queue.push({ id: crypto.randomUUID(), payload: item });
    });
  };

  const queueStore: QueueStore = {
    register,
    unregister,
    getQueue,
    add,
    get,
    getAll,
    remove,
    pause,
    resume,
    destroy,
    clear,
    getStats,
    queueIds,
    executeBatchTasks,
  };

  return queueStore;
});
