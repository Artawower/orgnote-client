<template>
  <router-view />
</template>

<script lang="ts">
export default {
  name: 'App',
};
</script>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { jsBabel } from './plugins/js-babel';
import { RouteNames } from './router/routes';
import {
  useAuthStore,
  useOrgBabelStore,
  useLoggerStore,
  useSyncStore,
  useOrgNoteApiStore,
} from './stores';
import { decodeAuthState, extractAuthQueryInfo } from './tools';

const syncStore = useSyncStore();

useLoggerStore().init();

syncStore.markToSync();

const orgBabelStore = useOrgBabelStore();
orgBabelStore.register(jsBabel);

if (window.navigator.standalone) {
  document.body.classList.add('standalone');
}

const authStore = useAuthStore();

const router = useRouter();

// TODO: master move to external method.
async function handleCordovaAuth(url: string) {
  const urlParams = url.split('?')?.[1];
  if (!urlParams) {
    return;
  }
  const searchParams = new URLSearchParams(urlParams);

  const personalInfo = extractAuthQueryInfo(Object.fromEntries(searchParams));
  console.debug('✎: [AUTH] personalInfo: ', personalInfo);
  const state = decodeAuthState(searchParams.get('state'));
  console.debug('✎: [AUTH] state: ', state);

  await authStore.authUser(personalInfo, searchParams.get('token'));

  if (state.redirectUrl) {
    window.location.assign(`/#${state.redirectUrl}`);
    return;
  }

  router.push({ name: RouteNames.Home });
}
(window as unknown as { handleOpenURL: (arg0: string) => void }).handleOpenURL =
  handleCordovaAuth.bind(this);

const { orgNoteApi } = useOrgNoteApiStore();
window.orgnote = orgNoteApi;
</script>
