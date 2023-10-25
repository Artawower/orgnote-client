/// <reference lib="webworker" />
import { WorkerAction, WorkerEventType } from './graph.actions';

function updateGraph(payload: WorkerAction) {
  console.log(`✎: [shared-worker][${new Date().toString()}] UPDATE GRAPH`);
}

const messageHandlers: {
  [key in WorkerEventType]?: (payload: WorkerAction) => void;
} = {
  [WorkerEventType.UpdateGraph]: updateGraph,
};

onmessage = (e) => {
  const { data } = e as { data: WorkerAction };
  messageHandlers[data.type]?.(data);
};
