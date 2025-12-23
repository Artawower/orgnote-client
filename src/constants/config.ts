import type { OrgNoteConfig } from 'orgnote-api';

export const DEFAULT_PANE_PERSISTENCE_SAVE_DELAY = 500;

export const DEFAULT_FUST_THRESHOLD = 0.4;

export const DEFAULT_SAVE_DELAY_MS = 500;
export const DEFAULT_VALIDATION_DELAY_MS = 1000;

export const DEFAULT_CONFIG: OrgNoteConfig = {
  editor: {
    showSpecialSymbols: false,
    showPropertyDrawer: true,
    saveDelayMs: DEFAULT_SAVE_DELAY_MS,
    validationDelayMs: DEFAULT_VALIDATION_DELAY_MS,
  },
  developer: {
    developerMode: false,
    maximumLogsCount: 1000,
    storeQueueTasksMinutes: 60,
    corsProxy: 'https://org-note.com/cors/',
  },
  system: {
    language: 'en-US',
  },
  completion: {
    showGroup: false,
    defaultCompletionLimit: 500,
    fuseThreshold: DEFAULT_FUST_THRESHOLD,
  },
  synchronization: {
    type: 'none',
  },
  ui: {
    showUserProfiles: true,
    theme: 'light',
    darkThemeName: null,
    lightThemeName: null,
    enableAnimations: true,
    notificationTimeout: 5000,
    persistantPanes: true,
    persistantPanesSaveDelay: DEFAULT_PANE_PERSISTENCE_SAVE_DELAY,
    dropZoneEdgeRatio: 0.25,
  },
  extensions: {
    sources: ['https://github.com/Artawower/orgnote-extensions'],
  },
  encryption: {
    type: 'disabled',
  },
  fileReaders: {
    preferredReaders: {},
  },
};
