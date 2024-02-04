import { ExtensionsWorkerAction } from './extensions.actions';
import { ClientWorkerConnection } from './worker/client-worker-connection';

export const newExtensionsWorker = () => {
  const worker = new Worker(
    new URL('./extensions.worker.ts', import.meta.url),
    {
      type: 'module',
    }
  );
  const client = new ClientWorkerConnection<ExtensionsWorkerAction>(worker);
  worker.postMessage({ type: 'hello world' });
  return client;
};
