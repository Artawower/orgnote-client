import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { ModelsAPIToken } from 'src/generated/api';
import { ref } from 'vue';
import { Dark } from 'quasar';
import {} from 'pinia-plugin-persistedstate';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const tokens = ref<ModelsAPIToken[]>([]);

    const showUserProfiles = ref<boolean>(true);
    const locale = ref<string>('en-US');
    const darkMode = ref<boolean | 'auto'>('auto');

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

    const setDarkMode = (mode: boolean | 'auto') => {
      darkMode.value = mode;
      updateDarkMode();
    };

    const updateDarkMode = () => {
      Dark.set(darkMode.value);
    };

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
    };
  },
  { persist: { afterRestore: ({ store }) => store.updateDarkMode() } }
);
