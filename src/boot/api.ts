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
import { getCssVar } from 'quasar';
import {
  getCssTheme,
  getNumericCssVar,
  getCssProperty,
  getCssNumericProperty,
  applyCSSVariables,
  resetCSSVariables,
} from 'src/utils/css-utils';
import { useUiStore } from 'src/stores/ui';

const repositories = await initRepositories();

let api: OrgNoteApi;

function initApi(): void {
  const ui = useUiStore();
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
      setBottomBarBackground: ui.setBottomBarBackground,
      setStatusBarBackground: ui.setStatusBarBackground,
    },
  };
}

export default defineBoot(async ({ app, store }) => {
  initApi();
  const splashScreen = useSplashScreen();
  splashScreen.show();
  await sleep(1000);
  store.use(() => ({ api: api as OrgNoteApi }));
  app.provide(ORGNOTE_API_PROVIDER_TOKEN, api);
  app.provide(REPOSITORIES_PROVIDER_TOKEN, repositories);
  splashScreen.hide();
});

export { api, repositories };
