<template>
  <h2 class="text-h2 absolute-center text-center">
    {{ $t('Wait a second, we are trying to identify you') }}
  </h2>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { User } from 'src/models';
import { AUTH_PAGE_ROUTE, RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();

const authStore = useAuthStore();

const $q = useQuasar();

if (!$q.platform.is.desktop) {
  // NOTE: Try to open mobile app
  const mobileAppUrl = `orgnote//${AUTH_PAGE_ROUTE}${window.location.search}`;
  window.open(mobileAppUrl, '_system');
}

const userInfo: User = {
  avatarUrl: route.query.avatarUrl as string,
  email: route.query.email as string,
  nickName: route.query.username as string,
  profileUrl: route.query.profileUrl as string,
  id: route.query.id as string,
};

authStore.authUser(userInfo, route.query.token as string);

const router = useRouter();
router.push({ name: RouteNames.Home });
</script>
