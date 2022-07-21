import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { User } from 'src/models';

interface AuthState {
  user?: User;
  token?: string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),
  actions: {
    async authViaGithub() {
      try {
        const rspns = await sdk.login('github');
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
  },
  persist: true,
});
