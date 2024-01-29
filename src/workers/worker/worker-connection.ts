import { BaseWorkerConnection } from './base-worker-connection';
import { KeepAliveAction } from './worker.actions';
import { interval, takeUntil } from 'rxjs';
import { v4 as uuid } from 'uuid';

export class WorkerConnection<
  T extends { type: string; [key: string]: unknown }
> extends BaseWorkerConnection<T> {
  public readonly id: string = uuid();

  private readonly keepAliveTimeout: number = 1000;

  constructor(public worker: Worker) {
    super(worker);
    this.registerKeepAliveChecker();
  }

  /**
   * This method solve the problem of the shared worker detecting that the tab is closed
   * More info of potential alternatives here.
   *
   * https://stackoverflow.com/questions/13662089/javascript-how-to-know-if-a-connection-with-a-shared-worker-is-still-alive
   */
  private registerKeepAliveChecker(): void {
    interval(1000)
      .pipe(takeUntil(this.closed$))
      .subscribe(() => {
        const timeoutId = setTimeout(() => {
          this.closed$.next();
          // this.worker.close();
        }, this.keepAliveTimeout);
        this.worker.postMessage(new KeepAliveAction(timeoutId));
      });
  }

  public toString(): string {
    return `[Shared worker connection: ${this.id}]`;
  }
}
