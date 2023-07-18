import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { OAuthProvider } from 'src/boot/sdk';
import { ModelsPublicUser } from 'src/generated/api';
import { ref } from 'vue';
import { useSettingsStore } from './settings';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string>();
    const user = ref<ModelsPublicUser>();
    const provider = ref<OAuthProvider>('github');

    const authViaGithub = async () => {
      try {
        const rspns = (await sdk.auth.authProviderLoginGet(provider.value))
          .data;
        window.location.replace(rspns.data.redirectUrl);
      } catch (e) {
        console.log('✎: [line 22][auth.ts] e: ', e);
        // TODO: master  add error handler, notification service
      }
    };

    const resetAuthInfo = () => {
      user.value = null;
      token.value = null;
    };

    const logout = async () => {
      const settingsStore = useSettingsStore();
      settingsStore.reset();
      resetAuthInfo();
      await sdk.auth.authLogoutGet();
    };

    const verifyUser = async () => {
      if (!token.value) {
        return;
      }
      try {
        const { data } = (await sdk.auth.authVerifyGet()).data;
        user.value = data;
        console.log(`✎: [auth.ts][${new Date().toString()}] set user`);
      } catch (e: unknown) {
        if ((e as AxiosError).response.status === 400) {
          resetAuthInfo();
        }
      } finally {
        console.log(`✎: [auth.ts][${new Date().toString()}] auth completed`);
      }
    };

    const authUser = (u: ModelsPublicUser, t: string) => {
      user.value = u;
      token.value = t;
    };

    return {
      token,
      user,
      provider,

      authViaGithub,
      logout,
      verifyUser,
      authUser,
    };
  },
  { persist: true }
);
