import { useSettingsStore } from './settings';
import { useSyncStore } from './sync';
import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
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

    const authViaGithub = async () => {
      try {
        const params = await AuthApiAxiosParamCreator().authProviderLoginGet(
          provider.value
        );
        console.log('✎: [line 29][auth.ts] params: ', params.url);
        // const rspns = (await sdk.auth.authProviderLoginGet(provider.value))
        //   .data;
        const authUrl = `${process.env.AUTH_DOMAIN}/${params.url}`;
        console.log('✎: [line 35][auth.ts] authUrl: ', authUrl);
        window.open(authUrl, '_system');
        // console.log(
        //   '✎: [line 31][auth.ts] rspns.data.redirectUrl: ',
        //   rspns.data.redirectUrl
        // );
      } catch (e) {
        console.log('✎: [line 22][auth.ts] e: ', e);
        // TODO: master  add error handler, notification service
      }
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
