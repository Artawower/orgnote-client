import { OrgNoteConfig } from 'orgnote-api';

export const DEFAULT_CONFIG: OrgNoteConfig = {
  editor: {
    showSpecialSymbols: false,
    showPropertyDrawer: true,
  },
  common: {
    developerMode: false,
    maximumLogsCount: 1000,
  },
  completion: {
    showGroup: false,
    defaultCompletionLimit: 500,
  },
  ui: {
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
