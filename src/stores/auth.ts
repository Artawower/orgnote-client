import { useSettingsStore } from './settings';
import { useSyncStore } from './sync';
import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { sdk } from 'src/boot/axios';
import { useNotifications } from 'src/hooks';
import { OAuthProvider, PersonalInfo } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { v4 } from 'uuid';
import { useRouter } from 'vue-router';

import { ref } from 'vue';

const defaultUserAccount = (): PersonalInfo => ({
  id: v4(),
  nickName: 'Anonymous',
  isAnonymous: true,
});

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string>();
    const user = ref<PersonalInfo>();
    const provider = ref<OAuthProvider>('github');
    const $q = useQuasar();
    const notificaitons = useNotifications();
    const router = useRouter();

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
        // TODO: master quick tmp solution.
        // common OAuth for mobile and web
        const authUrl = `${process.env.AUTH_URL}/auth/login/${provider}?state=mobile`;
        console.log('✎: [line 42][auth.ts] authUrl: ', authUrl);
        window.open(authUrl, '_system');
        return;
      }
      const rspns = (await sdk.auth.authProviderLoginGet(provider, 'desktop'))
        .data;

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
        // TODO: master move error handling to special function
        if ((e as AxiosError).response.status === 400) {
          resetAuthInfo();
        }
      }
    };

    const syncStore = useSyncStore();
    const authUser = async (u: PersonalInfo, t: string) => {
      user.value = u;
      token.value = t;
      syncStore.syncNotes();
    };

    const subscribe = async (token: string) => {
      try {
        await sdk.auth.authSubscribePost({ token });
        await verifyUser();
      } catch (e) {
        if (!(e as AxiosError).response.status) {
          throw e;
        }
        const axiosErr = e as AxiosError<{ message?: string }>;
        notificaitons.notify(axiosErr.response.data?.message, true, 'error');
        return;
      }
    };

    const removeUserAccount = async () => {
      if (user.value && !user.value.isAnonymous) {
        await sdk.auth.authAccountDelete();
      }
      localStorage.clear();
      router.push(RouteNames.Home);
      window.location.reload();
    };

    return {
      token,
      user,
      provider,
      auth,

      authViaGithub,
      logout,
      verifyUser,
      authUser,
      subscribe,
      removeUserAccount,
    };
  },
  { persist: true }
);
