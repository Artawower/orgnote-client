import type { Command } from 'orgnote-api';
import { DefaultCommands, RouteNames, I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import { useRouteActive } from 'src/composables/use-route-active';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import TheSettings from 'src/containers/TheSettings.vue';
import { defineAsyncComponent } from 'vue';

export function getSettingsommands(): Command[] {
  const confirmationModal = api.ui.useConfirmationModal();

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
      headerTitleComponent: defineAsyncComponent(
        () => import('src/containers/SettingsHeaderTitle.vue'),
      ),
      modalProps: {
        initialRoute: routeName,
      },
    });
  };

  const commands: Command[] = [
    {
      command: DefaultCommands.SETTINGS,
      group: 'global',
      icon: 'sym_o_settings',
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
      command: DefaultCommands.DELETE_ALL_DATA,
      icon: 'sym_o_delete',
      group: 'settings',
      handler: async () => {
        const confirm = await confirmationModal.confirm({
          title: I18N.CLEAR_ALL_LOCAL_DATA,
          message: I18N.CONFIRM_DELETE_ALL_DATA,
        });
        console.log('✎: [line 155][settings-commands.ts] confirm: ', confirm);
      },
    },
    {
      command: DefaultCommands.DELETE_ALL_NOTES,
      icon: 'sym_o_event_busy',
      group: 'settings',
      handler: async () => {
        const confirm = await confirmationModal.confirm({
          title: I18N.DELETE_ALL_NOTES,
          message: I18N.CONFIRM_DELETE_NOTES,
        });
        console.log('✎: [line 155][settings-commands.ts] confirm: ', confirm);
      },
    },
    {
      command: DefaultCommands.DELETE_ACCOUNT,
      icon: 'sym_o_event_busy',
      group: 'settings',
      handler: async () => {
        const confirm = await confirmationModal.confirm({
          title: I18N.REMOVE_ACCOUNT,
          message: I18N.CONFIRM_DELETE_ACCOUNT,
        });
        console.log('✎: [line 155][settings-commands.ts] confirm: ', confirm);
      },
    },
  ];

  return commands;
}
