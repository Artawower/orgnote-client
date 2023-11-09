import { ElectronApi } from '../../src-electron/electron-api';

interface Navigator extends Navigator {
  standalone: boolean;
  userAgentData?: {
    platform: string;
  };
}

// declare var electron: ElectronApi;
declare global {
  const electron: ElectronApi;
  interface Window {
    electron: ElectronApi;
  }
}
