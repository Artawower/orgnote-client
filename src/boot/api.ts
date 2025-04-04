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
import { useToolbarStore } from 'src/stores/toolbar';
import { useModalStore } from 'src/stores/modal';
import { useSettingsStore } from 'src/stores/settings';
import { useSettingsUiStore } from 'src/stores/settings-ui';
import type { App } from 'vue';
import { copyToClipboard } from 'src/utils/clipboard';
import { uploadFile, uploadFiles } from 'src/utils/file-upload';
import { useConfirmationModal } from 'src/composables/use-confirmation-modal';
import { useCompletionStore } from 'src/stores/completion';
import { usePaneStore } from 'src/stores/pane';
import { useFileSystemManagerStore } from 'src/stores/file-system-manager';
import { useFileManagerStore } from 'src/stores/file-manager';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import { useConfigStore } from 'src/stores/config';

let api: OrgNoteApi;
let repositories: OrgNoteApi['infrastructure'];

async function initApi(app: App): Promise<void> {
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
      useSettings: useSettingsStore,
      useCompletion: useCompletionStore,
      useQuasar: useQuasar,
      usePane: usePaneStore,
      useFileSystemManager: useFileSystemManagerStore,
      useFileManager: useFileManagerStore,
      useConfig: useConfigStore,
      app,
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

      copyToClipboard,

      uploadFile,
      uploadFiles,
    },
    ui: {
      useSplashScreen,
      useBackgroundSettings,
      useSidebar: useSidebarStore,
      useToolbar: useToolbarStore,
      useModal: useModalStore,
      useSettingsUi: useSettingsUiStore,
      useConfirmationModal,
      useScreenDetection,
    },
  };
}

const syncConfigurations = async (api: OrgNoteApi) => {
  await api.core.useConfig().sync();
};

export default defineBoot(async ({ app, store }) => {
  const splashScreen = useSplashScreen();
  splashScreen.show();
  await initApi(app);
  // await sleep(1000);
  store.use(() => ({ api: api as OrgNoteApi }));
  app.provide(ORGNOTE_API_PROVIDER_TOKEN, api);
  app.provide(REPOSITORIES_PROVIDER_TOKEN, api.repositories);
  await syncConfigurations(api);
  splashScreen.hide();
});

export { api, repositories };
