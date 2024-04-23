import { useDiStore } from 'src/stores';
import { GraphAction } from './graph.actions';
import { ClientWorkerConnection } from './worker/client-worker-connection';
import { Pinia } from 'pinia';

export const newGraphWorker = (
  pinia?: Pinia
): ClientWorkerConnection<GraphAction> => {
  if (process.env.CLIENT) {
    const di = useDiStore(pinia);
    return di.graphWorker;
  }
};
