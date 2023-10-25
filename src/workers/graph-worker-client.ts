import { WorkerAction } from './graph.actions';
import { ClientWorkerConnection } from './worker/client-worker-connection';

export const newGraphSwClient = () => {
  const worker = new Worker(new URL('./graph.worker.ts', import.meta.url), {
    type: 'module',
  });
  const client = new ClientWorkerConnection<WorkerAction>(worker);
  return client;
};
