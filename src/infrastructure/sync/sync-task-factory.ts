import type { SyncPlan } from 'orgnote-api';
import { SyncOperationType } from 'orgnote-api';
import { toRaw } from 'vue';
import { useQueueStore } from 'src/stores/queue';
import type { SyncQueueTask } from 'src/models/sync-queue-task';
import { SYNC_QUEUE_ID } from 'src/constants/queue-ids';

const createSyncTasks = (plan: SyncPlan): SyncQueueTask[] => [
  ...plan.toUpload.map((data) => ({
    type: SyncOperationType.Upload,
    data: toRaw(data),
    serverTime: plan.serverTime,
  })),
  ...plan.toDownload.map((data) => ({
    type: SyncOperationType.Download,
    data: toRaw(data),
    serverTime: plan.serverTime,
  })),
  ...plan.toDeleteLocal.map((data) => ({
    type: SyncOperationType.DeleteLocal,
    data: toRaw(data),
    serverTime: plan.serverTime,
  })),
  ...plan.toDeleteRemote.map((data) => ({
    type: SyncOperationType.DeleteRemote,
    data: toRaw(data),
    serverTime: plan.serverTime,
  })),
];

export const enqueuePlanOperations = (plan: SyncPlan): number => {
  const tasks = createSyncTasks(plan);

  if (tasks.length === 0) {
    return 0;
  }

  const queueStore = useQueueStore();

  tasks.forEach((task) => {
    void queueStore.add(SYNC_QUEUE_ID, task);
  });

  return tasks.length;
};

export const isPlanEmpty = (plan: SyncPlan): boolean =>
  plan.toUpload.length === 0 &&
  plan.toDownload.length === 0 &&
  plan.toDeleteLocal.length === 0 &&
  plan.toDeleteRemote.length === 0;
