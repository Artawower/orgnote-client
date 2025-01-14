import type { SettingsUiStore } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsUiStore = defineStore('settings-ui', () => {
  const settingsMenu = ref({
    main: [
      DefaultCommands.SYSTEM_SETTINGS,
      DefaultCommands.LANGUAGE_SETTINGS,
      DefaultCommands.INTERFACE_SETTINGS,
      DefaultCommands.SYNCHRONISATION_SETTINGS,
      DefaultCommands.SUBSCRIPTION_SETTINGS,
    ],
  });

  const store: SettingsUiStore = {
    settingsMenu,
  };

  return store;
});
