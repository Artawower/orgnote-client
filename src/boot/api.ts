import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import {
  ORGNOTE_API_PROVIDER_TOKEN,
  REPOSITORIES_PROVIDER_TOKEN,
} from 'src/constants/app-providers';
import { initRepositories } from 'src/infrastructure/repositories';
import { useCommandsGroupStore } from 'src/stores/command-group';
import { useCommandsStore } from 'src/stores/command';
import { useExtensionsStore } from 'src/stores/extension';
import { useFileSystemStore } from 'src/stores/file-system';
import {
  mobileOnly,
  clientOnly,
  androidOnly,
  serverOnly,
  desktopOnly,
} from 'src/utils/platform-specific';
import { useEncryptionStore } from 'src/stores/encryption';
import { sleep } from 'src/utils/sleep';
import { useSplashScreen } from 'src/composables/use-splash-screen';
import { getCssVar, useQuasar } from 'quasar';
import {
  getCssTheme,
  getNumericCssVar,
  getCssProperty,
  getCssNumericProperty,
  applyCSSVariables,
  resetCSSVariables,
} from 'src/utils/css-utils';
import { useBackgroundSettings } from 'src/composables/background';
import { useSidebarStore } from 'src/stores/sidebar';

let api: OrgNoteApi;
let repositories: OrgNoteApi['infrastructure'];

async function initApi(): Promise<void> {
  repositories = await initRepositories();
  api = {
    infrastructure: {
      ...repositories,
    },
    core: {
      useCommands: useCommandsStore,
      useCommandsGroup: useCommandsGroupStore,
      useExtenions: useExtensionsStore,
      useFileSystem: useFileSystemStore,
      useEncryption: useEncryptionStore,
      useQuasar: useQuasar,
    },
    utils: {
      mobileOnly,
      clientOnly,
      androidOnly,
      serverOnly,
      desktopOnly,

      getCssVar,
      getCssTheme,
      getNumericCssVar,
      getCssProperty,
      getCssNumericProperty,
      applyCSSVariables,
      resetCSSVariables,
    },
    ui: {
      useSplashScreen,
      useBackgroundSettings,
      useSidebar: useSidebarStore,
    },
  };
}

export default defineBoot(async ({ app, store }) => {
  const splashScreen = useSplashScreen();
  splashScreen.show();
  await initApi();
  await sleep(1000);
  store.use(() => ({ api: api as OrgNoteApi }));
  app.provide(ORGNOTE_API_PROVIDER_TOKEN, api);
  app.provide(REPOSITORIES_PROVIDER_TOKEN, api.repositories);
  splashScreen.hide();
});

export { api, repositories };
