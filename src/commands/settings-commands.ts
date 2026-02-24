import type { Command, CommandHandlerParams, CommandIcon } from 'orgnote-api';
import { DefaultCommands, RouteNames, i18n, I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { useRouteActive } from 'src/composables/use-route-active';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import TheSettings from 'src/containers/TheSettings.vue';
import AppIcon from 'src/components/AppIcon.vue';
import { getDatabase } from 'src/infrastructure/repositories';
import { to } from 'orgnote-api/utils';
import { defineAsyncComponent, defineComponent, h } from 'vue';
import AppAvatar from 'src/components/AppAvatar.vue';
import { usePanePersistence } from 'src/composables/pane-persistence';
import { downloadTextFile } from 'src/utils/download-text-file';
import {
  buildLocalSyncProfileToml
} from 'src/utils/local-sync-profile-config';

const SettingsHeaderTitle = defineAsyncComponent(
  () => import('src/containers/SettingsHeaderTitle.vue'),
);

const ExtensionManager = defineAsyncComponent(() => import('src/containers/ExtensionManager.vue'));

const SettingsCommandIcon = defineComponent({
  name: 'SettingsCommandIcon',
  setup() {
    const auth = api.core.useAuth();

    return () => {
      const avatarUrl = auth.user?.avatarUrl;
      if (!avatarUrl) {
        return h(AppIcon, { name: 'sym_o_settings', size: 'sm' });
      }

      return h(AppAvatar, { url: avatarUrl, size: 'xs' });
    };
  },
});

export function getSettingsCommands(): Command[] {
  const confirmationModal = api.ui.useConfirmationModal();
  const notifications = api.core.useNotifications();

  const copyLocalSyncConfig = async (): Promise<void> => {
    const result = await to(async () => {
      const content = buildLocalSyncProfileToml(api);
      await api.utils.copyToClipboard(content);
    })();

    if (result.isErr()) {
      reporter.reportError(result.error);
      return;
    }

    notifications.notify({
      message: I18N.SYNC_PROFILE_CONFIG_EXPORTED,
      description: I18N.SYNC_PROFILE_CONFIG_EXPORTED_DESCRIPTION,
      level: 'info',
    });
  };

  const downloadLocalSyncConfig = async (): Promise<void> => {
    const result = await to(async () => {
      const content = buildLocalSyncProfileToml(api);
      downloadTextFile('orgnote-sync-profile.toml', content);
    })();

    if (result.isErr()) {
      reporter.reportError(result.error);
      return;
    }

    notifications.notify({
      message: I18N.SYNC_PROFILE_CONFIG_DOWNLOADED,
      description: I18N.SYNC_PROFILE_CONFIG_DOWNLOADED_DESCRIPTION,
      level: 'info',
    });
  };

  const isActiveRoute = (routeName: RouteNames): boolean => {
    const settingsRouter = api.core.app._context.provides[SETTINGS_ROUTER_PROVIDER_TOKEN];
    const { isActive } = useRouteActive(settingsRouter);
    return isActive(routeName);
  };

  const openSettingsRoute = (routeName: string) => {
    const modal = api.ui.useModal();
    const isModalOpened = modal.component && modal.component === TheSettings;
    const settingsRouter = api.core.app._context.provides[SETTINGS_ROUTER_PROVIDER_TOKEN];
    if (isModalOpened) {
      settingsRouter.push({ name: routeName });
      return;
    }
    modal.open(TheSettings, {
      title: 'settings',
      closable: true,
      wide: true,
      headerTitleComponent: SettingsHeaderTitle,
      modalProps: {
        initialRoute: routeName,
      },
    });
  };

  const settingsIcon: CommandIcon = SettingsCommandIcon;

  const commands: Command[] = [
    {
      command: DefaultCommands.SETTINGS,
      group: 'global',
      icon: settingsIcon,
      handler: () => openSettingsRoute(RouteNames.SettingsPage),
      isActive: () => isActiveRoute(RouteNames.SettingsPage),
    },
    {
      command: DefaultCommands.STORAGE_SETTINGS,
      group: 'settings',
      icon: 'sym_o_save',
      handler: () => openSettingsRoute(RouteNames.StorageSettings),
      isActive: () => isActiveRoute(RouteNames.StorageSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.SYSTEM_SETTINGS,
      group: 'settings',
      icon: 'sym_o_settings',
      handler: () => openSettingsRoute(RouteNames.SystemSettings),
      isActive: () => isActiveRoute(RouteNames.SystemSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.LANGUAGE_SETTINGS,
      group: 'settings',
      icon: 'language',
      handler: () => openSettingsRoute(RouteNames.LanguageSettings),
      isActive: () => isActiveRoute(RouteNames.LanguageSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.INTERFACE_SETTINGS,
      group: 'settings',
      icon: 'sym_o_wallpaper',
      handler: () => openSettingsRoute(RouteNames.InterfaceSettings),
      isActive: () => isActiveRoute(RouteNames.InterfaceSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.SYNCHRONISATION_SETTINGS,
      group: 'settings',
      icon: 'sym_o_sync',
      handler: () => openSettingsRoute(RouteNames.SynchronisationSettings),
      isActive: () => isActiveRoute(RouteNames.SynchronisationSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.EXPORT_LOCAL_SYNC_CONFIG,
      group: 'settings',
      icon: 'content_copy',
      description: I18N.SYNC_PROFILE_CONFIG_EXPORTED_DESCRIPTION,
      handler: copyLocalSyncConfig,
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.DOWNLOAD_LOCAL_SYNC_CONFIG,
      group: 'settings',
      icon: 'download',
      description: I18N.SYNC_PROFILE_CONFIG_DOWNLOADED_DESCRIPTION,
      handler: downloadLocalSyncConfig,
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.SUBSCRIPTION_SETTINGS,
      group: 'settings',
      icon: 'sym_o_loyalty',
      handler: () => openSettingsRoute(RouteNames.SubscriptionSettings),
      isActive: () => isActiveRoute(RouteNames.SubscriptionSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.KEYBINDINGS_SETTINGS,
      group: 'settings',
      icon: 'keyboard',
      handler: () => openSettingsRoute(RouteNames.KeybindingSettings),
      isActive: () => isActiveRoute(RouteNames.KeybindingSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.DEVELOPER_SETTINGS,
      group: 'settings',
      icon: 'sym_o_terminal',
      handler: () => openSettingsRoute(RouteNames.DeveloperSettings),
      isActive: () => isActiveRoute(RouteNames.DeveloperSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.EXTENSIONS_SETTINGS,
      group: 'settings',
      icon: 'sym_o_extension',
      handler: () => openSettingsRoute(RouteNames.ExtensionsSettings),
      isActive: () => isActiveRoute(RouteNames.ExtensionsSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.OPEN_EXTENSIONS_MANAGER,
      group: 'global',
      icon: 'sym_o_extension',
      handler: () => {
        const modal = api.ui.useModal();
        modal.open(ExtensionManager, {
          title: i18n.EXTENSIONS,
          closable: true,
          wide: true,
        });
      },
    },
    {
      command: DefaultCommands.ENCRYPTION_SETTINGS,
      group: 'settings',
      icon: 'sym_o_extension',
      handler: () => openSettingsRoute(RouteNames.EncryptionSettings),
      isActive: () => isActiveRoute(RouteNames.EncryptionSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.API_SETTINGS,
      group: 'settings',
      icon: 'sym_o_hub',
      handler: () => openSettingsRoute(RouteNames.ApiSettings),
      isActive: () => isActiveRoute(RouteNames.ApiSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.AUTHENTICATION_SETTINGS,
      group: 'settings',
      icon: 'sym_o_person',
      handler: () => openSettingsRoute(RouteNames.AuthenticationSettings),
      isActive: () => isActiveRoute(RouteNames.AuthenticationSettings),
      context: {
        narrow: true,
      },
    },
    {
      command: DefaultCommands.RESET_SYSTEM,
      icon: 'sym_o_update',
      group: 'settings',
      description: i18n.RESET_SYSTEM_DESCRIPTION,
      handler: async (api, params: CommandHandlerParams<{ force?: boolean }>) => {
        const confirm =
          params.data?.force ||
          (await confirmationModal.confirm({
            title: i18n.RESET_SYSTEM,
            message: i18n.RESET_SYSTEM_WARNING,
          }));

        if (!confirm) {
          return;
        }

        const panePersistence = usePanePersistence();
        panePersistence.stop();

        const fileSystem = api.core.useFileSystem();
        const clearResult = await to(
          () => fileSystem.removeAllFiles(),
          'Failed to clear file system',
        )();

        if (clearResult.isErr()) {
          reporter.reportError(clearResult.error);
          return;
        }

        const db = getDatabase();
        await db?.delete();

        localStorage.clear();
        sessionStorage.clear();

        window.location.reload();
      },
    },
    {
      command: DefaultCommands.DELETE_ALL_NOTES,
      icon: 'sym_o_event_busy',
      group: 'settings',
      handler: async () => {
        await confirmationModal.confirm({
          title: i18n.DELETE_ALL_NOTES,
          message: i18n.CONFIRM_DELETE_NOTES,
        });

      },
    },
    {
      command: DefaultCommands.DELETE_ACCOUNT,
      icon: 'sym_o_event_busy',
      group: 'settings',
      handler: async () => {
        await confirmationModal.confirm({
          title: i18n.REMOVE_ACCOUNT,
          message: i18n.CONFIRM_DELETE_ACCOUNT,
        });

      },
    },
  ];

  return commands;
}
