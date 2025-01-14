import type { Command } from 'orgnote-api';
import { DefaultCommands, RouteNames } from 'orgnote-api';
import { api } from 'src/boot/api';
import { useRouteActive } from 'src/composables/use-route-active';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import TheSettings from 'src/containers/TheSettings.vue';
import { defineAsyncComponent } from 'vue';

export function getSettingsommands(): Command[] {
  const modal = api.ui.useModal();

  const isActiveRoute = (routeName: RouteNames): boolean => {
    const settingsRouter = api.core.app._context.provides[SETTINGS_ROUTER_PROVIDER_TOKEN];
    const { isActive } = useRouteActive(settingsRouter);
    return isActive(routeName);
  };

  const openSettingsRoute = (routeName: string) => {
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
  ];

  return commands;
}
