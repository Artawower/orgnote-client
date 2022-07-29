import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { Token } from 'src/models';

interface SettingsState {
  tokens?: Token[];
  showUserProfiles?: boolean;
}

// for correct type
const p = { persist: true };

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    tokens: [],
    showUserProfiles: true,
  }),
  getters: {},
  actions: {
    setTokens(tokens: Token[]) {
      this.tokens = tokens;
    },
    async createNewToken() {
      const { data } = await sdk.createToken();
      this.tokens = [...this.tokens, data];
    },
    reset() {
      this.tokens = [];
    },
    async removeToken(token: Token) {
      this.tokens = this.tokens.filter((t) => t.id !== token.id);
      try {
        await sdk.deleteToken(token.id);
      } catch (e) {
        // TODO: master  real error handling
        this.tokens = [...this.tokens, token];
      }
    },
    async getApiTokens() {
      try {
        this.tokens = (await sdk.getApiTokens()).data;
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
