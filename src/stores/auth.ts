import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { OAuthProvider } from 'src/boot/sdk';
import { ModelsPublicUser } from 'src/generated/api';
import { useSettingsStore } from './settings';

interface AuthState {
  user?: ModelsPublicUser;
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
        const rspns = (await sdk.auth.authProviderLoginGet(this.provider)).data;
        window.location.replace(rspns.data.redirectUrl);
      } catch (e) {
        // TODO: master  add error handler
      }
    },
    authUser(user: ModelsPublicUser, token: string) {
      this.user = user;
      this.token = token;
    },
    async logout() {
      const settingsStore = useSettingsStore();
      settingsStore.reset();
      this.user = null;
      this.token = null;
      await sdk.auth.authLogoutGet();
    },
    async verifyUser() {
      if (!this.token) {
        return;
      }
      try {
        const { data } = (await sdk.auth.authVerifyGet()).data;
        this.user = data;
      } catch (e: unknown) {
        if ((e as AxiosError).response.status === 400) {
          this.user = null;
          this.token = null;
        }
      }
    },
  },
  persist: true,
});
