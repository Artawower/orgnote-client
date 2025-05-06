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
import { useAuthStore } from './stores/auth';
import { decodeAuthState, extractAuthQueryInfo, mockServer } from './tools';
import { useSyncStore } from './stores/sync';
import { useLoggerStore } from './stores/logger';
import { useSystemInfoStore } from './stores/system-info';
import { useOrgBabelStore } from './stores/org-babel';
import { useOrgNoteApiStore } from './stores/orgnote-api.store';
import { App, URLOpenListenerEvent } from '@capacitor/app';

const syncStore = useSyncStore();
syncStore.markToSync();

// TODO: master create bootstrap hook
useLoggerStore().init();

const systemStore = useSystemInfoStore();
systemStore.loadSystemInfo();

const orgBabelStore = useOrgBabelStore();
orgBabelStore.register(jsBabel);

if (process.env.CLIENT && window.navigator.standalone) {
  document.body.classList.add('standalone');
}
const authStore = useAuthStore();

const router = useRouter();

// TODO: master move to external method.
async function handleCordovaAuth(event: URLOpenListenerEvent) {
  const urlParams = event.url.split('?')?.[1];
  if (!urlParams) {
    return;
  }
  const searchParams = new URLSearchParams(urlParams);

  const personalInfo = extractAuthQueryInfo(Object.fromEntries(searchParams));
  console.debug('✎: [AUTH] personalInfo: ', personalInfo);
  const state = decodeAuthState(searchParams.get('state'));
  console.debug('✎: [AUTH] state: ', state);

  await authStore.authUser(personalInfo, searchParams.get('token'));

  if (process.env.CLIENT && state.redirectUrl) {
    window.location.assign(`/#${state.redirectUrl}`);
    return;
  }

  router.push({ name: RouteNames.Home });
}

const { orgNoteApi } = useOrgNoteApiStore();

mockServer(() => App.addListener('appUrlOpen', handleCordovaAuth))();

const initPublicOrgNoteApi = () => (window.orgnote = orgNoteApi);

mockServer(initPublicOrgNoteApi)();
</script>
