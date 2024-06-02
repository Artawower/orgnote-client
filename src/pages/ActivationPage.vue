<template>
  <div class="fit q-pa-md flex items-center justify-center">
    <div v-if="authStore.user.isAnonymous">
      <h3 class="text-h2 text-center">
        {{ $t('to activate the license key you need to log in to the system')
        }}<br />
      </h3>
      <login-buttons :redirect-url="redirectUrl" />
    </div>

    <template v-else>
      <h2 v-if="initialKey" class="text-h2 text-center">
        {{ $t('wait a second, we are trying to activate your account') }}<br />
      </h2>
      <div v-else class="color-secondary column gap-8 activation-form">
        <h2>{{ $t('Enter your activation key') }}</h2>
        <q-input
          class="color-white"
          standout="bg-black text-white"
          v-model="key"
          :label="$t('subscription key')"
        />
        <q-input
          class="color-white"
          standout="bg-black text-white"
          v-model="email"
          label="email"
        />
        <q-btn
          @click="activate"
          :disable="!key"
          flat
          color="primary"
          :label="$t('activate')"
          icon-right="send"
          class="gap-8"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { RouteNames } from 'src/router/routes';
import { useSettingsStore } from 'src/stores/settings';
import { sleep } from 'src/tools';
import { useRoute, useRouter } from 'vue-router';

import { computed, onBeforeMount, ref } from 'vue';

import LoginButtons from 'src/components/LoginButtons.vue';
import { useAuthStore } from 'src/stores/auth';

const initialKey = ref('');
const key = ref('');
const email = ref('');

const authStore = useAuthStore();
onBeforeMount(async () => {
  initFromQueryParams();
  if (!authStore.user || authStore.user.isAnonymous) {
    return;
  }
  await activate();
});

const route = useRoute();
const initFromQueryParams = () => {
  key.value = route.query.key as string;
  initialKey.value = key.value;
  email.value = route.query.email as string;
};

const redirectUrl = computed(
  () => window.location.pathname + window.location.search
);

const { config } = useSettingsStore();
const router = useRouter();
const activate = async () => {
  if (!key.value) {
    return;
  }
  await authStore.subscribe(key.value, email.value);
  if (config.common.developerMode) {
    await sleep(10000);
  }
  router.push({ name: RouteNames.Home });
};
</script>

<style lang="scss">
.activation-form {
  width: 480px;

  @include mobile {
    width: 100%;
  }
}
</style>
