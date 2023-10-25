import { WorkerAction, WorkerEventType } from './worker.actions';
import { Subject } from 'rxjs';

export class BaseWorkerConnection<Actions = unknown> {
  public readonly closed$: Subject<void> = new Subject();
  public readonly message$: Subject<WorkerAction | Actions> = new Subject();

  constructor(protected worker: Worker) {
    this.watchMessages();
  }

  protected watchMessages(): void {
    this.worker.onmessage = ({
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
    this.worker.postMessage(action);
  }
}
