import { OrgNoteConfig } from 'orgnote-api';
import { MenuButtonProps } from 'src/components/ui/MenuGroupButton.vue';

export const DEFAULT_CONFIG: OrgNoteConfig = {
  editor: {
    showSpecialSymbols: false,
    showPropertyDrawer: true,
  },
  developer: {
    developerMode: false,
    maximumLogsCount: 1000,
  },
  completion: {
    showGroup: false,
    defaultCompletionLimit: 500,
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

export type ConfigScheme = Record<
  string,
  {
    values?: Array<string | number | boolean>;
    type?: MenuButtonProps['type'];
  }
>;

export const AVAILABLE_CONFIG_SCHEME: ConfigScheme = {
  theme: {
    values: ['light', 'dark'],
  },
};
