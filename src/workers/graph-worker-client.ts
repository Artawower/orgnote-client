import { useDiStore } from 'src/stores/di.store';
import { GraphAction } from './graph.actions';
import { ClientWorkerConnection } from './worker/client-worker-connection';
import { Pinia } from 'pinia';
import { mockServer } from 'src/tools';

export const newGraphWorker = mockServer(
  (pinia?: Pinia): ClientWorkerConnection<GraphAction> => {
    const di = useDiStore(pinia);
    return di.graphWorker;
  }
);
