<template>
  <h2 class="text-h2 absolute-center text-center">
    {{ $t('Wait a second, we are trying to identify you') }}
  </h2>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { PersonalInfo } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { useSyncStore } from 'src/stores';
import { useAuthStore } from 'src/stores/auth';
import { useRoute, useRouter } from 'vue-router';

import { onBeforeMount } from 'vue';

const route = useRoute();

const authStore = useAuthStore();

const $q = useQuasar();

onBeforeMount(async () => {
  const initialProvider = route.params.initialProvider as string;
  if (initialProvider) {
    authStore.auth(initialProvider);
    return;
  }
  await setupUser();
});

const router = useRouter();
const syncStore = useSyncStore();
const setupUser = async () => {
  const isMobile = route.query.state !== 'desktop';
  console.log('✎: [line 34][auth] route.query.state: ', route.query.state);
  if (!$q.platform.is.cordova && $q.platform.is.mobile && isMobile) {
    // NOTE: Try to open mobile app
    const mobileAppUrl = `orgnote://auth/login${window.location.search}`;
    window.location.assign(mobileAppUrl);
    return;
  }

  const userInfo: PersonalInfo = {
    avatarUrl: route.query.avatarUrl as string,
    email: route.query.email as string,
    nickName: route.query.username as string,
    profileUrl: route.query.profileUrl as string,
    id: route.query.id as string,
    spaceLimit: +route.query.spaceLimit,
    usedSpace: +route.query.usedSpace,
  };

  authStore.authUser(userInfo, route.query.token as string);
  await syncStore.syncNotes();
  router.push({ name: RouteNames.Home });
};
</script>
