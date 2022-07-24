<template>
  <h2 class="text-h2 absolute-center text-center">
    {{ $t('Wait a second, we are trying to identify you') }}
  </h2>
</template>

<script lang="ts" setup>
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();

const authStore = useAuthStore();

authStore.authUser(
  {
    avatarUrl: route.query.avatarUrl as string,
    email: route.query.email as string,
    nickName: route.query.username as string,
    profileUrl: route.query.profileUrl as string,
  },
  route.query.token as string
);

const router = useRouter();
router.push({ name: RouteNames.Home });
</script>
