import type { OrgNoteApi } from 'orgnote-api';

declare global {
  interface Window {
    orgnote: OrgNoteApi;
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
