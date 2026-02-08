import type { LogLevel, OrgNoteConfig } from 'orgnote-api';
import { DEFAULT_FONT_FAMILIES } from './fonts';

export const DEFAULT_MIN_NOTIFICATION_LEVEL: LogLevel = process.env.DEV ? 'info' : 'error';

export const DEFAULT_PANE_PERSISTENCE_SAVE_DELAY = 500;
export const DEFAULT_TOOLTIP_DELAY = 300;

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
    developerMode: Boolean(process.env.DEV),
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
    theme: 'auto',
    darkThemeName: null,
    lightThemeName: null,
    enableAnimations: true,
    notificationTimeout: 5000,
    tooltipDelay: DEFAULT_TOOLTIP_DELAY,
    minNotificationLevel: DEFAULT_MIN_NOTIFICATION_LEVEL,
    persistantPanes: true,
    persistantPanesSaveDelay: DEFAULT_PANE_PERSISTENCE_SAVE_DELAY,
    dropZoneEdgeRatio: 0.25,
    fonts: { ...DEFAULT_FONT_FAMILIES },
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
