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
}
