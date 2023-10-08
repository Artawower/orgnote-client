import { useSettingsStore } from './settings';
import { useSyncStore } from './sync';
import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { sdk } from 'src/boot/axios';
import { AuthApiAxiosParamCreator } from 'src/generated/api';
import { OAuthProvider } from 'src/models';
import { User } from 'src/models';
import { v4 } from 'uuid';

import { ref } from 'vue';

const defaultUserAccount = (): User => ({
  id: v4(),
  nickName: 'Anonymous',
  isAnonymous: true,
});

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string>();
    const user = ref<User>();
    const provider = ref<OAuthProvider>('github');
    const $q = useQuasar();

    const authViaGithub = async () => {
      try {
        await auth(provider.value);
      } catch (e) {
        console.log('✎: [line 22][auth.ts] e: ', e);
        // TODO: master  add error handler, notification service
      }
    };

    const auth = async (provider: string) => {
      if ($q.platform.is.cordova) {
        const params = await AuthApiAxiosParamCreator().authProviderLoginGet(
          provider
        );
        console.log('✎: [line 29][auth.ts] params: ', params.url);
        const authUrl = `${process.env.AUTH_DOMAIN}/${params.url}`;
        console.log('✎: [line 35][auth.ts] authUrl: ', authUrl);
        window.open(authUrl, '_system');
        return;
      }
      const rspns = (await sdk.auth.authProviderLoginGet(provider)).data;

      window.location.replace(rspns.data.redirectUrl);

      return rspns;
    };

    const resetAuthInfo = () => {
      user.value = defaultUserAccount();
      token.value = null;
    };

    const logout = async () => {
      const settingsStore = useSettingsStore();
      settingsStore.reset();
      resetAuthInfo();
      await sdk.auth.authLogoutGet();
    };

    const verifyUser = async () => {
      if (!token.value || user.value.isAnonymous) {
        resetAuthInfo();
        return;
      }
      try {
        const { data } = (await sdk.auth.authVerifyGet()).data;
        user.value = data;
      } catch (e: unknown) {
        if ((e as AxiosError).response.status === 400) {
          resetAuthInfo();
        }
      }
    };

    const syncStore = useSyncStore();
    const authUser = (u: User, t: string) => {
      user.value = u;
      token.value = t;
      syncStore.syncNotes();
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
