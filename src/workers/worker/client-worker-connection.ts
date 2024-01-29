import { BaseWorkerConnection } from './base-worker-connection';
import {
  KeepAliveAction,
  WorkerAction,
  WorkerEventType,
} from './worker.actions';
import { Subject } from 'rxjs';

export class ClientWorkerConnection<
  Actions extends { type: string }
> extends BaseWorkerConnection<Actions> {
  public readonly error$: Subject<MessageEvent> = new Subject();

  protected watchMessages(): void {
    this.worker.onmessage = ({
      data,
    }: {
      data: WorkerAction & Actions;
    }): void => {
      const isKeepAliveAction = this.checkKeepAliveAction(
        data as unknown as KeepAliveAction
      );
      if (isKeepAliveAction) {
        return;
      }
      this.message$.next(data);
    };
    this.worker.onmessageerror = (error): void => {
      this.error$.next(error);
    };
  }

  private checkKeepAliveAction(data: KeepAliveAction): boolean {
    if (data.type === WorkerEventType.KeepAlive) {
      console.log(`✎: [shared-worker][${new Date().toString()}] KEEP ALIVE SW`);
      this.worker.postMessage(new KeepAliveAction(data.id));
      return true;
    }
  }

  public close(): void {
    this.closed$.next();
    this.worker.terminate();
  }
}
