import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { OAuthProvider } from 'src/boot/sdk';
import { User } from 'src/models';
import { useSettingsStore } from './settings';

interface AuthState {
  user?: User;
  token?: string;
  provider?: OAuthProvider;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    provider: 'github',
  }),
  actions: {
    chooseAuthProvider(provider: OAuthProvider): void {
      this.provider = provider;
    },
    async authViaGithub() {
      try {
        const rspns = await sdk.login(this.provider);
        window.location.replace(rspns.data.redirectUrl);
      } catch (e) {
        // TODO: master  add error handler
      }
    },
    authUser(user: User, token: string) {
      this.user = user;
      this.token = token;
    },
    async logout() {
      const settingsStore = useSettingsStore();
      settingsStore.reset();
      this.user = null;
      this.token = null;
      sdk.logout(this.provider);
    },
    async verifyUser() {
      if (!this.token) {
        return;
      }
      try {
        const { data } = await sdk.verifyUser();
        this.user = data;
      } catch (e: any) {
        if (e.response.status === 400) {
          this.user = null;
          this.token = null;
        }
      }
    },
  },
  persist: true,
});
