import {
  BrowserWindow,
  IpcMainEvent,
  IpcRenderer,
  ipcMain,
  ipcRenderer,
} from 'electron';

export class AuthSuccessAction {
  public readonly action = 'auth-success';
  constructor(public readonly payload?: string) {}
}

export class AuthAction {
  public readonly action = 'auth';
  constructor(public readonly payload?: string) {}
}

export type CommunicationAction = AuthSuccessAction | AuthAction;

export function sender(target: BrowserWindow | IpcRenderer) {
  return function (action: CommunicationAction) {
    if ((target as BrowserWindow)?.webContents) {
      return (target as BrowserWindow).webContents.send(
        action.action,
        action.payload
      );
    }
    return (target as IpcRenderer).send(action.action, action.payload);
  };
}

export function receiveOnce<T extends CommunicationAction>(
  action: T
): Promise<T['payload']> {
  return new Promise((resolve) => {
    ipcRenderer.once(action.action, (_, payload: T['payload']) => {
      resolve(payload);
    });
    ipcRenderer.send(action.action, action.payload);
  });
}

export function listen<T extends CommunicationAction>(
  action: T,
  callback: (payload: T['payload'], event: IpcMainEvent) => void
): void {
  ipcMain.on(action.action, (event, payload: T['payload']) => {
    callback(payload, event);
  });
}
