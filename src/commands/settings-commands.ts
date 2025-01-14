import type { Command } from 'orgnote-api';
import { DefaultCommands, RouteNames } from 'orgnote-api';
import { api } from 'src/boot/api';
import TheSettings from 'src/containers/TheSettings.vue';
import { defineAsyncComponent } from 'vue';

export function getSettingsommands(): Command[] {
  const modal = api.ui.useModal();

  const openSettingsRoute = (routeName: string) => {
    const isModalOpened = modal.component && modal.component === TheSettings;
    if (isModalOpened) {
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
      icon: 'settings',
      handler: () => openSettingsRoute(RouteNames.SettingsPage),
    },
    {
      command: DefaultCommands.SYSTEM_SETTINGS,
      group: 'settings',
      icon: 'settings',
      handler: () => openSettingsRoute(RouteNames.SystemSettings),
    },
    {
      command: DefaultCommands.LANGUAGE_SETTINGS,
      group: 'settings',
      icon: 'language',
      handler: () => openSettingsRoute(RouteNames.LanguageSettings),
    },
  ];

  return commands;
}
