import type { SettingsUiStore } from 'orgnote-api';
import { DefaultCommands, RouteNames } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useRouteActive } from 'src/composables/use-route-active';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';
import { inject, ref } from 'vue';
import type { Router } from 'vue-router';

export const useSettingsUiStore = defineStore('settings-ui', () => {
  const isActiveRoute = (routeName: RouteNames): boolean => {
    const settingsRouter = inject<Router>(SETTINGS_ROUTER_PROVIDER_TOKEN);
    const { isActive } = useRouteActive(settingsRouter);
    return isActive(routeName);
  };

  const settingsMenu = ref({
    main: [
      {
        name: 'system',
        narrow: true,
        icon: 'sym_o_settings',
        command: DefaultCommands.SYSTEM_SETTINGS,
        isActive: () => isActiveRoute(RouteNames.SystemSettings),
      },
      {
        name: 'language',
        narrow: true,
        icon: 'language',
        command: DefaultCommands.LANGUAGE_SETTINGS,
        isActive: () => isActiveRoute(RouteNames.LanguageSettings),
      },
    ],
  });

  const store: SettingsUiStore = {
    settingsMenu,
  };

  return store;
});
