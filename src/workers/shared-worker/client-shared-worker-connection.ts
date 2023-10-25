import { BaseSharedWorkerConnection } from './base-shared-worker-connection';
import {
  KeepAliveAction,
  WorkerAction,
  WorkerEventType,
} from './worker.actions';
import { Subject } from 'rxjs';

export class ClientSharedWorkerConnection<
  Actions
> extends BaseSharedWorkerConnection<Actions> {
  public readonly error$: Subject<MessageEvent> = new Subject();

  protected watchMessages(): void {
    this.port.onmessage = ({
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
    this.port.onmessageerror = (error): void => {
      this.error$.next(error);
    };
  }

  private checkKeepAliveAction(data: KeepAliveAction): boolean {
    if (data.type === WorkerEventType.KeepAlive) {
      console.log(`✎: [shared-worker][${new Date().toString()}] KEEP ALIVE SW`);
      this.port.postMessage(new KeepAliveAction(data.id));
      return true;
    }
  }

  public close(): void {
    this.closed$.next();
    this.port.close();
  }
}
