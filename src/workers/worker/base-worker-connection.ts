import { WorkerAction, WorkerEventType } from './worker.actions';
import { Observable, Subject, filter } from 'rxjs';

export class BaseWorkerConnection<
  Actions extends { type: string },
  WorkerEventType extends string = string
> {
  public readonly closed$: Subject<void> = new Subject();
  public readonly message$: Subject<WorkerAction | Actions> = new Subject();

  constructor(protected worker: Worker) {
    this.watchMessages();
  }

  public watchMessage<T extends Actions>(type: WorkerEventType): Observable<T> {
    return this.message$.pipe(filter((m) => m.type === type)) as Observable<T>;
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
