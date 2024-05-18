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
import { decodeAuthState, extractAuthQueryInfo } from './tools';
import { useSyncStore } from './stores/sync';
import { useLoggerStore } from './stores/logger';
import { useSystemInfoStore } from './stores/system-info';
import { useOrgBabelStore } from './stores/org-babel';
import { useOrgNoteApiStore } from './stores/orgnote-api.store';

const syncStore = useSyncStore();
syncStore.markToSync();

// TODO: master create bootstrap hook
useLoggerStore().init();

const systemStore = useSystemInfoStore();
systemStore.loadNewReleaseInfo();

const orgBabelStore = useOrgBabelStore();
orgBabelStore.register(jsBabel);

if (process.env.CLIENT && window.navigator.standalone) {
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

  if (process.env.CLIENT && state.redirectUrl) {
    window.location.assign(`/#${state.redirectUrl}`);
    return;
  }

  router.push({ name: RouteNames.Home });
}
const { orgNoteApi } = useOrgNoteApiStore();

if (process.env.CLIENT) {
  (
    window as unknown as { handleOpenURL: (arg0: string) => void }
  ).handleOpenURL = handleCordovaAuth.bind(this);

  window.orgnote = orgNoteApi;
}
</script>
