import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import { ORGNOTE_API_PROVIDER_TOKEN } from 'src/constants/app-providers';
import { repositories } from './repositories';
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
import { platform, platformMatch } from 'src/utils/platform-detection';
import { useEncryptionStore } from 'src/stores/encryption';
import { useSplashScreen } from 'src/composables/use-splash-screen';
import { useQuasar } from 'quasar';
import {
  getCssTheme,
  getNumericCssVar,
  getCssProperty,
  getCssNumericProperty,
  applyCSSVariables,
  resetCSSVariables,
  getCssVar,
  applyScopedStyles,
  removeScopedStyles,
} from 'src/utils/css-utils';
import { useThemeStore } from 'src/stores/theme';
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
import { useLayoutStore } from 'src/stores/layout';
import { useFileSystemManagerStore } from 'src/stores/file-system-manager';
import { useFileManagerStore } from 'src/stores/file-manager';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import { useConfigStore } from 'src/stores/config';
import { useNotificationsStore } from 'src/stores/notifications';
import { useFileReaderStore } from 'src/stores/file-reader';
import { useBufferStore } from 'src/stores/buffer';
import { useLogStore } from 'src/stores/log';
import type { Router } from 'vue-router';
import { logger } from './logger';
import { useSystemInfo } from 'src/composables/use-system-info';
import { useContextMenuStore } from 'src/stores/context-menu';
import { useQueueStore } from 'src/stores/queue';
import { useCronStore } from 'src/stores/cron';
import { useGitStore } from 'src/stores/git';
import { useExtensionRegistryStore } from 'src/stores/extension-registry';
import { useFileGuardStore } from 'src/stores/file-guard';
import { parseToml, stringifyToml } from 'orgnote-api/utils';
import { useFileWatcherStore } from 'src/stores/file-watcher';
import { buildOrgNoteUrl } from 'src/utils/build-orgnote-url';
import { useAuthStore } from 'src/stores/auth';
import { useSyncStore } from 'src/stores/sync';
import { useEditorStore } from 'src/stores/editor';
import { useOrgBabelStore } from 'src/stores/org-babel';
import { wsClient } from 'src/infrastructure/websocket-client';

let api: OrgNoteApi;
async function initApi(app: App, router: Router): Promise<void> {
  api = {
    infrastructure: {
      ...repositories,
      websocket: wsClient,
    },
    core: {
      useCommands: useCommandsStore,
      useCommandsGroup: useCommandsGroupStore,
      useExtensions: useExtensionsStore,
      useFileSystem: useFileSystemStore,
      useFileWatcher: useFileWatcherStore,
      useEncryption: useEncryptionStore,
      useSettings: useSettingsStore,
      useCompletion: useCompletionStore,
      useQuasar: useQuasar,
      usePane: usePaneStore,
      useLayout: useLayoutStore,
      useFileSystemManager: useFileSystemManagerStore,
      useFileManager: useFileManagerStore,
      useConfig: useConfigStore,
      useNotifications: useNotificationsStore,
      useFileReader: useFileReaderStore,
      useBuffers: useBufferStore,
      useLog: useLogStore,
      useSystemInfo,
      useQueue: useQueueStore,
      useCron: useCronStore,
      useGit: useGitStore,
      useExtensionRegistry: useExtensionRegistryStore,
      useFileGuard: useFileGuardStore,
      useAuth: useAuthStore,
      useSync: useSyncStore,
      useEditor: useEditorStore,
      useBabel: useOrgBabelStore,
      app,
    },
    utils: {
      platform,
      platformMatch,
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
      applyScopedStyles,
      removeScopedStyles,

      copyToClipboard,

      uploadFile,
      uploadFiles,

      logger,

      parseToml,
      stringifyToml,

      buildOrgNoteUrl,
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
      useContextMenu: useContextMenuStore,
      useTheme: useThemeStore,
    },
    vue: {
      router,
    },
  };
}

const syncConfigurations = async (api: OrgNoteApi) => {
  await api.core.useConfig().sync();
};

export default defineBoot(async ({ app, store, router }) => {
  logger.info('Booting application and initializing API...');
  const splashScreen = useSplashScreen();
  await splashScreen.show();
  logger.info('Start initializing API');
  await initApi(app, router);
  logger.info('API initialized');
  store.use(() => ({ api: api as OrgNoteApi }));

  app.provide(ORGNOTE_API_PROVIDER_TOKEN, api);
  logger.info('Start synchronizing configurations');
  await syncConfigurations(api);
  if (typeof window !== 'undefined') {
    window.orgnote = api;
  }
  logger.info('Configurations synchronized');

  await splashScreen.hide();
  logger.info('Application boot process finished');
});

export { api };
