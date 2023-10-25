import { WorkerAction, WorkerEventType } from './worker.actions';
import { Subject } from 'rxjs';

export class BaseSharedWorkerConnection<Actions = unknown> {
  public readonly closed$: Subject<void> = new Subject();
  public readonly message$: Subject<WorkerAction | Actions> = new Subject();

  constructor(protected port: MessagePort) {
    this.watchMessages();
  }

  protected watchMessages(): void {
    this.port.onmessage = ({
      data,
    }: {
      data: WorkerAction & Actions;
    }): void => {
      if (data.type === WorkerEventType.KeepAlive) {
        clearTimeout(data.id);
        return;
      }
      this.message$.next(data);
    };
  }

  public emit(action: WorkerAction | Actions): void {
    this.port.postMessage(action);
  }
}
