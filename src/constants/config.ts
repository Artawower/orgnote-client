import type { OrgNoteConfig } from 'orgnote-api';

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
  synchronization: {
    type: 'api',
  },
  ui: {
    showUserProfiles: true,
    theme: 'light',
    darkThemeName: null,
    lightThemeName: null,
    enableAnimations: true,
    notificationTimeout: 5000,
  },
  extensions: {
    sources: ['https://github.com/Artawower/orgnote-extensions'],
  },
  encryption: {
    type: 'disabled',
  },
};
