<template>
  <div
    class="q-gutter-sm login-button flex flex-center"
    :class="vertical ? 'q-py-md' : 'q-pa-md'"
  >
    <q-btn @click="authGithub" round flat outline icon="fa-brands fa-github">
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth';

import { ref } from 'vue';

const authStore = useAuthStore();

const props = defineProps<{
  vertical?: boolean;
  redirectUrl?: string;
}>();

const vertical = ref(props.vertical);

const authGithub = () => {
  authStore.authViaGithub(props.redirectUrl);
};
</script>
