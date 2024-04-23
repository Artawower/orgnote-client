import { boot } from 'quasar/wrappers';
import { GraphAction } from 'src/workers';
import { ClientWorkerConnection } from 'src/workers/worker/client-worker-connection';

export default boot(({ store }) => {
  const worker = new Worker(
    new URL('../workers/graph.worker.ts', import.meta.url),
    {
      type: 'module',
    }
  );
  const client = new ClientWorkerConnection<GraphAction>(worker);
  store.use(() => ({ graphWorker: client }));
});
