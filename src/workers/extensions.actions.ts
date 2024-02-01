export enum ExtensionsWorkerEvent {
  Refreshed = 'packages refreshed',
  RefreshAll = 'refresh packages',
}

export class RefreshExtensions {
  public readonly type = ExtensionsWorkerEvent.RefreshAll;
  constructor(public readonly sources: string[]) {}
}

export class ExtensionsRefreshed {
  public readonly type = ExtensionsWorkerEvent.Refreshed;
  constructor() {}
}

export type ExtensionsWorkerAction = RefreshExtensions | ExtensionsRefreshed;
