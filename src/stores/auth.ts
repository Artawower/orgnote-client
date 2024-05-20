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
import { mockServer } from 'src/tools';

const defaultUserAccount = (): PersonalInfo => ({
  id: v4(),
  nickName: 'Anonymous',
  isAnonymous: true,
});

export interface AuthState {
  environment: string;
  redirectUrl?: string;
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const defaultProvider: OAuthProvider = 'github';
    const token = ref<string>();
    const user = ref<PersonalInfo>();
    const provider = ref<OAuthProvider>(defaultProvider);
    const $q = useQuasar();
    const notificaitons = useNotifications();
    const router = useRouter();

    const authViaGithub = async (redirectUrl?: string) => {
      try {
        await auth({
          provider: provider.value ?? defaultProvider,
          redirectUrl,
        });
      } catch (e) {
        console.log('✎: [line 22][auth.ts] e: ', e);
        // TODO: master  add error handler, notification service
      }
    };

    const auth = async ({
      provider,
      environment = 'desktop',
      redirectUrl,
    }: {
      provider: string;
      environment?: string;
      redirectUrl?: string;
    }) => {
      if (!process.env.CLIENT) {
        return;
      }
      const state: AuthState = { environment, redirectUrl };
      const authUrl = getAuthUrl(provider, state);

      if ($q.platform.is.cordova) {
        // TODO: master quick tmp solution.
        // common OAuth for mobile and web
        window.open(authUrl, '_system');
        return;
      }

      if ($q.platform.is.electron && electron) {
        const { redirectUrl } = await electron.auth(authUrl);
        router.push(redirectUrl);
        return;
      }

      const rspns = (
        await sdk.auth.authProviderLoginGet(provider, buildAuthState(state))
      ).data;
      window.location.replace(rspns.data.redirectUrl);

      return rspns;
    };

    const getAuthUrl = (provider: string, state: AuthState): string => {
      const strState = encodeURIComponent(buildAuthState(state));
      return `${process.env.AUTH_URL}/auth/login/${provider}?state=${strState}`;
    };

    const buildAuthState = (state: AuthState): string => {
      return JSON.stringify(state);
    };

    const resetAuthInfo = () => {
      user.value = defaultUserAccount();
      token.value = null;
    };

    const logout = async () => {
      const settingsStore = useSettingsStore();
      settingsStore.reset();
      resetAuthInfo();
      router.push({ name: RouteNames.Home });
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
        if ((e as AxiosError).response?.status === 400) {
          resetAuthInfo();
        }
      }
    };

    const syncStore = useSyncStore();
    const authUser = async (u: PersonalInfo, t: string) => {
      user.value = u;
      token.value = t;
      try {
        await syncStore.markToSync();
      } catch (e) {
        if (!(e as AxiosError).response.status) {
          throw e;
        }
      }
    };

    const subscribe = async (token: string, email?: string) => {
      try {
        await sdk.auth.authSubscribePost({ token, email });
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
      verifyUser: mockServer(verifyUser),
      authUser,
      subscribe,
      removeUserAccount,
    };
  },
  { persist: true }
);
