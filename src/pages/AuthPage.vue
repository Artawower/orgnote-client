<template>
  <div class="absolute-center">
    <h2 class="text-h2 text-center capitalize">
      {{ $t('wait a second, we are trying to identify you') }}<br />
    </h2>
    <div
      class="color-secondary q-pt-lg q-pl-lg"
      v-if="config.common.developerMode"
    >
      <div class="capitalize">
        {{ $t('this message appears because developer mode is enabled') }}
      </div>
      <div>Route state: {{ route.query.state }}</div>
      <div>Is native app: {{ !!$q.platform.is.cordova }}</div>
      <div>Is mobile: {{ !!$q.platform.is.mobile }}</div>
    </div>
    <h3>
      <a v-if="mobileUrl" :href="mobileUrl">{{ $t('return to mobile app') }}</a>
    </h3>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import { useSettingsStore } from 'src/stores/settings';
import {
  decodeAuthState,
  extractAuthQueryInfo,
  getMobileAppUrl,
  sleep,
} from 'src/tools';
import { useRoute, useRouter } from 'vue-router';

import { computed, onBeforeMount, ref } from 'vue';

const route = useRoute();

const authStore = useAuthStore();

const $q = useQuasar();

const state = computed(() => decodeAuthState(route.query.state as string));

onBeforeMount(async () => {
  const initialProvider = route.params.initialProvider as string;
  if (initialProvider) {
    authStore.auth({
      provider: initialProvider,
      environment: state.value.environment,
    });
    return;
  }
  await setupUser();
});

const router = useRouter();
const { config } = useSettingsStore();

const mobileUrl = ref<string>();

const setupUser = async () => {
  if (!process.env.CLIENT) {
    return;
  }
  const isMobile = route.query.state !== 'desktop';
  if (config.common.developerMode) {
    await sleep(10000);
  }
  if (
    !$q.platform.is.cordova &&
    $q.platform.is.mobile &&
    isMobile &&
    !window.navigator.standalone &&
    // TODO: feat/server-side-rendering remove this line
    !$q.platform.is.ios // Tmp disable opening mobile app for ios device
  ) {
    const mobileAppUrl = getMobileAppUrl(`auth/login${window.location.search}`);
    window.location.assign(mobileAppUrl);
    return;
  }

  const state = decodeAuthState(route.query.state as string);
  const personalInfo = extractAuthQueryInfo(
    route.query as Record<string, string>
  );

  await authStore.authUser(personalInfo, route.query.token as string);
  if (state.redirectUrl) {
    window.location.assign(state.redirectUrl);
    return;
  }
  router.push({ name: RouteNames.Home });
};
</script>
