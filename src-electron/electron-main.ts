import { AuthAction, AuthSuccessAction, listen, sender } from './communication';
import { BrowserWindow, app } from 'electron';
import { shell } from 'electron';
import os from 'os';
import path from 'path';

require('@electron/remote/main').initialize();
// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;
// TODO: enh/electron-oauth move to environment
const deepLink = 'orgnotes';

const openDevTools = (win: BrowserWindow) => {
  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    win.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    win.webContents.on('devtools-opened', () => {
      win?.webContents.closeDevTools();
    });
  }
};

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    frame: false,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });
  require('@electron/remote/main').enable(mainWindow.webContents);

  openDevTools(mainWindow);

  mainWindow.loadURL(process.env.APP_URL);

  // NOTE: master handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (
      details.url.startsWith('https://org-note.com') ||
      details.url.startsWith(`${deepLink}://`)
    ) {
      return { action: 'allow' };
    }
    shell.openExternal(details.url);
    return { action: 'deny' };
  });
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

let authWindow: BrowserWindow | null = null;
const auth = (url: string) => {
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
  });

  authWindow.webContents.on('will-redirect', handleOAuthRedirect);
  authWindow.loadURL(url);
  authWindow.on('closed', function () {
    authWindow = null;
  });
  openDevTools(authWindow);
};

const authUrl = `${process.env.AUTH_URL}/auth/login`;
function handleOAuthRedirect(_, url: string): void {
  if (!url.startsWith(authUrl)) {
    return;
  }
  const u = new URL(url);
  sender(mainWindow)(new AuthSuccessAction(`${u.pathname}${u.search}`));
  authWindow?.close();
}

app.whenReady().then(() => {
  createWindow();
  listen(new AuthAction(), auth);
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(deepLink, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(deepLink);
}
