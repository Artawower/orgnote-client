import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { ModelsAPIToken } from 'src/generated/api';

interface SettingsState {
  tokens?: ModelsAPIToken[];
  showUserProfiles?: boolean;
  locale?: string;
}

// for correct type
const p = { persist: true };

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    tokens: [],
    showUserProfiles: true,
    locale: 'en-US',
  }),
  getters: {},
  actions: {
    setLocale(locale: string) {
      this.locale = locale;
    },
    setTokens(tokens: ModelsAPIToken[]) {
      this.tokens = tokens;
    },
    async createNewToken() {
      const { data } = (await sdk.auth.authTokenPost()).data;
      this.tokens = [...this.tokens, data];
    },
    reset() {
      this.tokens = [];
    },
    async removeToken(token: ModelsAPIToken) {
      this.tokens = this.tokens.filter((t) => t.id !== token.id);
      try {
        await sdk.auth.authTokenDelete(token.id);
      } catch (e) {
        // TODO: master  real error handling
        this.tokens = [...this.tokens, token];
      }
    },
    async getApiTokens() {
      try {
        this.tokens = (await sdk.auth.authApiTokensGet()).data.data;
      } catch (e) {
        // TODO: master  real error handling
      }
    },
    toggleProfileVisibility() {
      this.showUserProfiles = !this.showUserProfiles;
    },
  },
  ...p,
});
