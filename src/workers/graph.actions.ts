import { NoteGraph } from 'src/models';

export enum GraphWorkerEvent {
  UpdateGraph = 'update graph',
  GraphUpdated = 'graph updated',
}

export class UpdateGraph {
  public readonly type = GraphWorkerEvent.UpdateGraph;
}

export class GraphUpdated {
  public readonly type = GraphWorkerEvent.GraphUpdated;
  constructor(public readonly payload: NoteGraph) {}
}

export type GraphAction = UpdateGraph | GraphUpdated;
