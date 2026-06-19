import type { BrowserWindow, IpcMainEvent } from 'electron';
import type { Hotkey } from 'orgnote-api';
import { KEYBINDING_MODIFIERS } from 'orgnote-api';
import { BrowserWindow as ElectronBrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { ELECTRON_KEYBINDING_CHANNELS } from './electron-keybinding-channels';

const TRAFFIC_LIGHT_POSITION = { x: 10, y: 10 };

type ElectronInput = Electron.Input;

interface ResolvedModifiers {
  control: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

interface CreateMainWindowOptions {
  currentDir: string;
  protocolScheme: string;
  onClosed: () => void;
}

const buildProductionUrl = (protocolScheme: string): string => `${protocolScheme}://./index.html`;

const loadInitialUrl = async (window: BrowserWindow, protocolScheme: string): Promise<void> => {
  if (process.env.DEV) {
    await window.loadURL(process.env.APP_URL);
    return;
  }
  await window.loadURL(buildProductionUrl(protocolScheme));
};

const configureDevTools = (window: BrowserWindow): void => {
  if (process.env.DEBUGGING) {
    window.webContents.openDevTools();
    return;
  }
  window.webContents.on('devtools-opened', () => {
    window.webContents.closeDevTools();
  });
};

const isHotkey = (payload: unknown): payload is Hotkey => {
  if (!payload || typeof payload !== 'object') return false;
  const hotkey = payload as Record<string, unknown>;
  const modifiers = hotkey.modifiers;
  return (
    typeof hotkey.key === 'string' &&
    (modifiers === undefined ||
      (Array.isArray(modifiers) && modifiers.every((modifier) => typeof modifier === 'string')))
  );
};

const readHotkeys = (payload: unknown): Hotkey[] => {
  if (!Array.isArray(payload)) return [];
  return payload.filter(isHotkey);
};

const resolveHotkeyModifiers = (hotkey: Hotkey): ResolvedModifiers => {
  const modifiers = hotkey.modifiers ?? [];
  const isDarwin = process.platform === 'darwin';
  return {
    control:
      modifiers.includes(KEYBINDING_MODIFIERS.CTRL) ||
      (!isDarwin && modifiers.includes(KEYBINDING_MODIFIERS.MOD)),
    meta:
      modifiers.includes(KEYBINDING_MODIFIERS.META) ||
      (isDarwin && modifiers.includes(KEYBINDING_MODIFIERS.MOD)),
    alt: modifiers.includes(KEYBINDING_MODIFIERS.ALT),
    shift: modifiers.includes(KEYBINDING_MODIFIERS.SHIFT),
  };
};

const hotkeyMatchesInput = (hotkey: Hotkey, input: ElectronInput): boolean => {
  const modifiers = resolveHotkeyModifiers(hotkey);
  return (
    input.key.toLowerCase() === hotkey.key.toLowerCase() &&
    input.control === modifiers.control &&
    input.meta === modifiers.meta &&
    input.alt === modifiers.alt &&
    input.shift === modifiers.shift
  );
};

const configureMenuShortcutPassthrough = (window: BrowserWindow): void => {
  let appHotkeys: Hotkey[] = [];

  const updateAppHotkeys = (event: IpcMainEvent, payload: unknown): void => {
    if (event.sender !== window.webContents) return;
    appHotkeys = readHotkeys(payload);
  };

  const updateMenuShortcutMode = (_event: Electron.Event, input: ElectronInput): void => {
    const isAppHotkey = appHotkeys.some((hotkey) => hotkeyMatchesInput(hotkey, input));
    window.webContents.setIgnoreMenuShortcuts(isAppHotkey);
  };

  ipcMain.on(ELECTRON_KEYBINDING_CHANNELS.setAppHotkeys, updateAppHotkeys);
  window.webContents.on('before-input-event', updateMenuShortcutMode);
  window.on('closed', () => {
    ipcMain.removeListener(ELECTRON_KEYBINDING_CHANNELS.setAppHotkeys, updateAppHotkeys);
  });
};

export async function createMainWindow(options: CreateMainWindowOptions): Promise<BrowserWindow> {
  const window = new ElectronBrowserWindow({
    icon: path.resolve(options.currentDir, 'icons/icon.png'),
    width: 1000,
    height: 600,
    useContentSize: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: TRAFFIC_LIGHT_POSITION,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(
        options.currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  });

  configureDevTools(window);
  configureMenuShortcutPassthrough(window);
  window.on('closed', options.onClosed);
  await loadInitialUrl(window, options.protocolScheme);
  return window;
}

