import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { OAuthProvider } from 'src/boot/sdk';
import { User } from 'src/models';

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
        console.log('🦄: [line 14][auth.ts] [35me: ', JSON.stringify(e));
      }
    },
    authUser(user: User, token: string) {
      this.user = user;
      this.token = token;
    },
    async logout() {
      this.user = null;
      this.token = null;
      sdk.logout(this.provider);
    },
  },
  persist: true,
});
