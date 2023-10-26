import { NoteGraph } from 'src/models';

export enum WorkerEventType {
  UpdateGraph = 'update graph',
  GraphUpdated = 'graph updated',
}

export class UpdateGraphAction {
  public readonly type = WorkerEventType.UpdateGraph;
}

export class GraphUpdatedAction {
  public readonly type = WorkerEventType.GraphUpdated;
  constructor(public readonly payload: NoteGraph) {}
}

export type WorkerAction = UpdateGraphAction | GraphUpdatedAction;
