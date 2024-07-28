import { OrgNoteConfig } from 'orgnote-api';
import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';

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
    type?: MenuItemProps['type'];
  }
>;

export const AVAILABLE_CONFIG_SCHEME: ConfigScheme = {
  theme: {
    values: ['light', 'dark', 'auto'],
  },
  defaultCompletionLimit: {
    type: 'number',
  },
  maximumLogsCount: {
    type: 'number',
  },
  type: {
    values: [
      ModelsPublicNoteEncryptionTypeEnum.GpgKeys,
      ModelsPublicNoteEncryptionTypeEnum.GpgPassword,
      ModelsPublicNoteEncryptionTypeEnum.Disabled,
    ],
  },
};
