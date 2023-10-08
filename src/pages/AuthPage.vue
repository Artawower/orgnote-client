<template>
  <h2 class="text-h2 absolute-center text-center">
    {{ $t('Wait a second, we are trying to identify you') }}
  </h2>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { User } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import { useRoute, useRouter } from 'vue-router';

import { onBeforeMount } from 'vue';

const route = useRoute();

const authStore = useAuthStore();

const $q = useQuasar();

onBeforeMount(() => {
  const initialProvider = route.params.initialProvider as string;
  console.log('✎: [line 24][AuthPage.vue] initialProvider: ', initialProvider);
  if (initialProvider) {
    authStore.auth(initialProvider);
    return;
  }
  setupUser();
});

const router = useRouter();
const setupUser = () => {
  if (
    !$q.platform.is.cordova &&
    $q.platform.is.mobile &&
    !window.navigator.standalone
  ) {
    // NOTE: Try to open mobile app
    const mobileAppUrl = `orgnote://auth/login${window.location.search}`;
    console.log('✎: [line 37][AuthPage.vue] mobileAppUrl: ', mobileAppUrl);
    window.location.assign(mobileAppUrl);
    return;
  }

  const userInfo: User = {
    avatarUrl: route.query.avatarUrl as string,
    email: route.query.email as string,
    nickName: route.query.username as string,
    profileUrl: route.query.profileUrl as string,
    id: route.query.id as string,
  };

  authStore.authUser(userInfo, route.query.token as string);

  router.push({ name: RouteNames.Home });
};
</script>
