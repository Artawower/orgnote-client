import { useExtensionsStore } from './extensions';
import { defineStore } from 'pinia';
import 'pinia-plugin-persistedstate';
import { Dark } from 'quasar';
import { OrgNoteConfig } from 'src/api';
import { sdk } from 'src/boot/axios';
import { ModelsAPIToken } from 'src/generated/api';
import { StatusBar, Style } from '@capacitor/status-bar';

import { reactive, ref } from 'vue';
import { getCssVar } from 'src/tools';
import { mockMobile } from 'src/tools/mock-mobile';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const tokens = ref<ModelsAPIToken[]>([]);
    const showUserProfiles = ref<boolean>(true);
    const locale = ref<string>('en-US');
    const darkMode = ref<boolean | 'auto'>('auto');

    const config = reactive<OrgNoteConfig>({
      editor: {
        showSpecialSymbols: false,
        showPropertyDrawer: true,
      },
      common: {
        developerMode: false,
        maximumLogsCount: 1000,
      },
      completion: {
        showGroup: false,
        defaultCompletionLimit: 500,
      },
      ui: {
        theme: 'light',
        darkThemeName: null,
        lightThemeName: null,
      },
      extensions: {
        sources: ['https://github.com/Artawower/orgnote-extensions'],
      },
      encryption: {
        type: 'disabled',
      },
    });

    const setLocale = (lc: string) => {
      locale.value = lc;
    };
    const setTokens = (newTokens: ModelsAPIToken[]) => {
      tokens.value = newTokens;
    };

    const createNewToken = async () => {
      const { data } = (await sdk.auth.authTokenPost()).data;
      tokens.value = [...tokens.value, data];
    };

    const reset = () => {
      tokens.value = [];
    };

    const removeToken = async (token: ModelsAPIToken) => {
      tokens.value = tokens.value.filter((t) => t.id !== token.id);
      try {
        await sdk.auth.authTokenTokenIdDelete(token.id);
      } catch (e) {
        tokens.value = [...tokens.value, token];
      }
    };
    const getApiTokens = async () => {
      try {
        tokens.value = (await sdk.auth.authApiTokensGet()).data.data;
      } catch (e) {
        // TODO: master  real error handling
      }
    };
    const toggleProfileVisibility = () => {
      showUserProfiles.value = !showUserProfiles.value;
    };

    const setDarkMode = async (mode: boolean | 'auto'): Promise<void> => {
      const extensionStore = useExtensionsStore();
      darkMode.value = mode;
      await extensionStore.deactivateThemeExtension();

      const themeNameKey = darkMode.value ? 'darkThemeName' : 'lightThemeName';
      const themeName = config.ui[themeNameKey];
      if (themeName) {
        await extensionStore.activateExtension(themeName);
      }
      updateDarkMode();
    };

    const updateDarkMode = () => {
      Dark.set(darkMode.value);
      setupStatusBar();
    };

    const setupStatusBar = mockMobile((bgColor?: string) => {
      const backgroundColor = getCssVar(bgColor ?? '--bg');
      const style = darkMode.value ? Style.Dark : Style.Light;
      StatusBar.setBackgroundColor({ color: backgroundColor });
      StatusBar.setStyle({ style });
    });

    const setTheme = (themeName: string): void => {
      const themeSwitcher = Dark.isActive ? setDarkTheme : setLightTheme;
      themeSwitcher(themeName);
    };

    const setDarkTheme = (themeName: string): void => {
      config.ui.darkThemeName = themeName;
    };

    const setLightTheme = async (themeName: string): Promise<void> => {
      config.ui.lightThemeName = themeName;
    };

    updateDarkMode();

    return {
      tokens,
      showUserProfiles,
      locale,
      darkMode,
      setLocale,
      setTokens,
      createNewToken,
      reset,
      removeToken,
      getApiTokens,
      toggleProfileVisibility,
      setDarkMode,
      updateDarkMode,
      config,

      setTheme,
      setDarkTheme,
      setLightTheme,
      setupStatusBar,
    };
  },
  { persist: { afterRestore: ({ store }) => store.updateDarkMode() } }
);
