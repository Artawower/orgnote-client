import { ElectronApi } from '../../src-electron/electron-api';
import { OrgNoteApi } from 'src/api';
import { tinykeys } from 'tinykeys';

declare global {
  const electron: ElectronApi;

  interface Window {
    electron: ElectronApi;
    orgnote: OrgNoteApi;
    tinykeys: typeof tinykeys;
  }

  interface Navigator {
    standalone: boolean;
    userAgentData?: {
      platform: string;
    };
  }

  interface HTMLInputElement {
    webkitdirectory: boolean;
    directory: boolean;
  }

  interface NamedNodeMap {
    autocomplete?: string;
  }
}
