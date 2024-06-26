/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
import {
  AuthAction,
  AuthSuccessAction,
  receiveOnce,
  sender,
} from './communication';
import { ElectronApi } from './electron-api';
import { BrowserWindow } from '@electron/remote';
import { contextBridge, ipcRenderer } from 'electron';

const api: ElectronApi = {
  auth: async (url: string) => {
    sender(ipcRenderer)(new AuthAction(url));
    const redirectUrl = await receiveOnce(new AuthSuccessAction());
    return { redirectUrl };
  },
  minimize() {
    BrowserWindow.getFocusedWindow().minimize();
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow();

    if (win.isFullScreen()) {
      win.setFullScreen(false);
    } else {
      win.setFullScreen(true);
    }
  },

  close() {
    BrowserWindow.getFocusedWindow().close();
  },
};

contextBridge.exposeInMainWorld('electron', api);
