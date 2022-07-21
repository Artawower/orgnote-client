<template>
  <div class="q-pa-md q-gutter-sm login-button">
    <q-btn @click="authGithub" round flat outline>
      <div class="github-btn" :class="{ dark: $q.dark.isActive }"></div>
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();

const authGithub = () => {
  authStore.authViaGithub();
};
</script>

<style lang="scss">
.github-btn {
  width: 24px;
  height: 24px;
  mask-image: url('/icons/github.svg');
  mask-size: cover;
  background: $grey-9;

  &.dark {
    background: $grey-3;
  }
}
</style>
