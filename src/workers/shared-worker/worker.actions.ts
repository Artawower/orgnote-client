export enum WorkerEventType {
  KeepAlive = 'keep alive',
}

export class KeepAliveAction {
  public readonly type = WorkerEventType.KeepAlive;
  constructor(public readonly id: ReturnType<typeof setTimeout>) {}
}

export type WorkerAction = KeepAliveAction;
