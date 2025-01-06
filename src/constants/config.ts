import type { OrgNoteConfig } from 'orgnote-api';
import { platformSpecificValue } from 'src/utils/platform-specific-value';

export const DEFAULT_CONFIG: OrgNoteConfig = {
  editor: {
    showSpecialSymbols: false,
    showPropertyDrawer: true,
  },
  developer: {
    developerMode: false,
    maximumLogsCount: 1000,
  },
  system: {
    language: 'en-US',
  },
  completion: {
    showGroup: false,
    defaultCompletionLimit: 500,
  },
  vault: {
    type: platformSpecificValue({
      data: 'inmemory',
      mobile: 'filesystem',
      nativeMobile: 'filesystem',
    }),
    path: '',
  },
  synchronization: {
    type: 'api',
  },
  ui: {
    showUserProfiles: true,
    theme: 'light',
    darkThemeName: null,
    lightThemeName: null,
  },
  extensions: {
    sources: ['https://github.com/Artawower/orgnote-extensions'],
  },
  encryption: {
    type: 'disabled',
  },
};
