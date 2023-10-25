import { SharedWorkerConnection } from './shared-worker-connection';

export class SharedWorkerConnectionsPool<
  Actions extends { type: string } & unknown = { type: string },
  Events extends string | number | symbol = string
> {
  private readonly connections: SharedWorkerConnection<Actions>[] = [];
  constructor(
    private readonly sw: SharedWorkerGlobalScope,
    private readonly handlers: {
      [key in Events]?: (
        payload: Actions,
        connection: SharedWorkerConnection<Actions>,
        otherConnections: SharedWorkerConnection<Actions>[]
      ) => void;
    }
  ) {
    this.init();
  }

  private init(): void {
    this.sw.onconnect = (connectEvent: MessageEvent): void => {
      console.log(
        `✎: [shared-worker][${new Date().toString()}] New port connected to worker`
      );
      const port = connectEvent.ports[0];
      this.createConnection(port);
    };
  }

  private createConnection(port: MessagePort): void {
    const connection = new SharedWorkerConnection<Actions>(port);
    connection.message$.subscribe((action) => {
      const otherConnections = this.connections.filter(
        (c) => c.id !== connection.id
      );

      const handler = this.handlers[(action as Actions).type as Events];
      if (!handler) {
        return;
      }
      handler(action as Actions, connection, otherConnections);
    });
    this.connections.push(connection);
  }
}
