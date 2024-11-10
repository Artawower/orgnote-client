import { OrgNoteConfig } from 'orgnote-api';
import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';
import { Platform } from 'quasar';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';

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

// TODO: feat/settings move to orgnote api
export type ConfigScheme = Record<
  string,
  {
    values?: Array<string | number | boolean>;
    type?: MenuItemProps['type'];
  }
>;

export const UI_CONFIG_SCHEME: ConfigScheme = {
  theme: {
    values: ['light', 'dark', 'auto'],
  },
};

export const ENCRYPTION_CONFIG_SCHEME: ConfigScheme = {
  type: {
    values: [
      ModelsPublicNoteEncryptionTypeEnum.GpgKeys,
      ModelsPublicNoteEncryptionTypeEnum.GpgPassword,
      ModelsPublicNoteEncryptionTypeEnum.Disabled,
    ],
  },
};

export const COMPLETION_CONFIG_SCHEME: ConfigScheme = {
  defaultCompletionLimit: {
    type: 'number',
  },
};

export const DEVELOPER_CONFIG_SCHEME: ConfigScheme = {
  maximumLogsCount: {
    type: 'number',
  },
};

export const SYNCHRONIZATION_CONFIG_SCHEME: ConfigScheme = {
  type: {
    type: 'select',
    values: [
      'none',
      'api',
      // TODO: make function for dynamic array values depends on the environment
      ...(process.env.CIENT && Platform.is.mobile ? ['filesystem'] : []),
    ],
  },
};
