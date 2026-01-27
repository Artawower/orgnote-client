import type { LocalFile, RemoteFile, ProcessCallback, SyncContext } from 'orgnote-api';
import {
  processUpload,
  processDownload,
  processDeleteLocal,
  processDeleteRemote,
  SyncOperationType,
} from 'orgnote-api';
import { reporter } from 'src/boot/report';
import type { SyncQueueTask } from 'src/models/sync-queue-task';

const getTaskPath = (task: SyncQueueTask): string => {
  if (typeof task.data === 'string') return task.data;
  return task.data.path;
};


const processSyncTask = async (task: SyncQueueTask, ctx: SyncContext): Promise<void> => {
  const processors: Record<SyncOperationType, () => Promise<void>> = {
    [SyncOperationType.Upload]: () => processUpload(task.data as LocalFile, ctx),
    [SyncOperationType.Download]: () => processDownload(task.data as RemoteFile, ctx),
    [SyncOperationType.DeleteLocal]: () => processDeleteLocal(task.data as string, ctx),
    [SyncOperationType.DeleteRemote]: () => processDeleteRemote(task.data as string, ctx),
  };

  await processors[task.type]?.();
};

export interface SyncContextProvider {
  getContext: (serverTime: string) => SyncContext | null;
}

export const createQueueTaskProcessor = (provider: SyncContextProvider) => {
  return (rawTask: unknown, cb: ProcessCallback): void => {
    const { payload } = rawTask as { payload: SyncQueueTask };
    const ctx = provider.getContext(payload.serverTime);

    if (!ctx) {
      cb(new Error('Sync context not available'));
      return;
    }

    processSyncTask(payload, ctx)
      .then(() => cb(null))
      .catch((err) => {
        reporter.reportWarning(`${payload.type} failed: ${getTaskPath(payload)} - ${err}`);
        cb(err);
      });
  };
};
