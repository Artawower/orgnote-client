import { ElectronApi } from '../../src-electron/electron-api';
import { OrgNoteApi } from 'src/api';

declare global {
  const electron: ElectronApi;
  interface Window {
    electron: ElectronApi;
    orgnote: OrgNoteApi;
  }

  interface Navigator {
    standalone: boolean;
    userAgentData?: {
      platform: string;
    };
  }

  interface CordovaPlugins {
    clipboard: {
      copy: (payload: any, onSuccess?: () => void, onFail?: () => void) => void;
    };
  }

  const device: {
    available: boolean;
    cordova: string;
    isVirtual: boolean;
    isiOSAppOnMac: boolean;
    manufacturer: string;
    model: string;
    platform: string;
    sdkVersion: string;
    serial: string;
    uuid: string;
    version: string;
  };
}
