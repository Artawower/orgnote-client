import { useExtensionsStore } from './extensions';
import { defineStore } from 'pinia';
import 'pinia-plugin-persistedstate';
import { Dark } from 'quasar';
import { OrgNoteConfig } from 'src/api';
import { sdk } from 'src/boot/axios';
import { ModelsAPIToken } from 'src/generated/api';
import { StatusBar, Style } from '@capacitor/status-bar';

import { computed, reactive, ref, watch } from 'vue';
import { getCssVar } from 'src/tools';
import { mockMobile } from 'src/tools/mock-mobile';
import { DEFAULT_CONFIG } from 'src/constants/default-config.constant';
import { deepAssign } from 'src/tools/deep-assign';
import clone from 'rfdc';
import { useI18n } from 'vue-i18n';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const tokens = ref<ModelsAPIToken[]>([]);
    const locale = ref<string>('en-US');

    const loc = useI18n({ useScope: 'global' }).locale;
    loc.value = locale.value;

    const config = reactive<OrgNoteConfig>(clone()(DEFAULT_CONFIG));

    const setLocale = (lc: string) => {
      locale.value = lc;
    };

    watch(
      () => locale.value,
      (val) => {
        console.log('✎: [line 38][settings.ts] val: ', val);
        loc.value = val;
      }
    );
    const setTokens = (newTokens: ModelsAPIToken[]) => {
      tokens.value = newTokens;
    };

    const createNewToken = async () => {
      const { data } = (await sdk.auth.authTokenPost()).data;
      tokens.value = [...tokens.value, data];
    };

    const reset = () => {
      tokens.value = [];
      clearConfig();
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
    const setDarkMode = async (
      mode: OrgNoteConfig['ui']['theme']
    ): Promise<void> => {
      const extensionStore = useExtensionsStore();
      config.ui.theme = mode;
      // console.log('[line 74]: SETTTT!');
      await extensionStore.deactivateThemeExtension();

      const themeNameKey =
        config.ui.theme === 'dark' ? 'darkThemeName' : 'lightThemeName';
      const themeName = config.ui[themeNameKey];
      if (themeName) {
        await extensionStore.activateExtension(themeName);
      }
      updateDarkMode();
    };

    const updateDarkMode = () => {
      Dark.set(config.ui.theme === 'dark');
      setupStatusBar();
    };

    const setupStatusBar = mockMobile((bgColor?: string) => {
      const backgroundColor = getCssVar(bgColor ?? '--bg');
      const style = config.ui.theme === 'dark' ? Style.Dark : Style.Light;
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

    const clearConfig = () => {
      deepAssign(config, { ...DEFAULT_CONFIG });
    };

    updateDarkMode();

    const darkMode = computed(() => config.ui.theme === 'dark');

    watch(
      () => config.ui.theme,
      (curr, prev) => {
        if (prev === curr) {
          return;
        }
        setDarkMode(curr);
      }
    );

    return {
      tokens,
      locale,
      darkMode,
      setLocale,
      setTokens,
      createNewToken,
      reset,
      removeToken,
      getApiTokens,
      setDarkMode,
      updateDarkMode,
      config,

      setTheme,
      setDarkTheme,
      setLightTheme,
      setupStatusBar,
      clearConfig,
    };
  },
  { persist: { afterRestore: ({ store }) => store.updateDarkMode() } }
);
