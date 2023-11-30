import { ElectronApi } from '../../src-electron/electron-api';

declare global {
  const electron: ElectronApi;
  interface Window {
    electron: ElectronApi;
  }

  interface Navigator {
    standalone: boolean;
    userAgentData?: {
      platform: string;
    };
  }
}
