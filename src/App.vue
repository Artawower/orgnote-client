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
import { User } from './models';
import { jsBabel } from './plugins/js-babel';
import { RouteNames } from './router/routes';
import { useAuthStore, useOrgBabelStore, useSyncStore } from './stores';

const syncStore = useSyncStore();

syncStore.syncNotes();

// TODO: tmp place for register potential plugins.
// Will be moved into a separate file later.
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

  const userInfo: User = {
    avatarUrl: searchParams.get('avatarUrl'),
    email: searchParams.get('email'),
    nickName: searchParams.get('username'),
    profileUrl: searchParams.get('profileUrl'),
    id: searchParams.get('id'),
  };

  await authStore.authUser(userInfo, searchParams.get('token'));
  router.push({ name: RouteNames.Home });
}
(window as unknown as { handleOpenURL: (arg0: string) => void }).handleOpenURL =
  handleCordovaAuth.bind(this);
</script>
