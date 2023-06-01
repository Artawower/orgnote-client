<template>
  <div
    class="q-gutter-sm login-button flex flex-center"
    :class="vertical ? 'q-py-md' : 'q-pa-md'"
  >
    <q-btn @click="authGithub" round flat outline>
      <div class="github-btn" :class="{ dark: $q.dark.isActive }"></div>
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores/auth';
import { ref } from 'vue';

const authStore = useAuthStore();

const props = defineProps<{
  vertical?: boolean;
}>();

const vertical = ref(props.vertical);

const authGithub = () => {
  authStore.authViaGithub();
};
</script>

<style lang="scss">
.github-btn {
  width: var(--social-btn-size);
  height: var(--social-btn-size);
  mask-image: url('/icons/github.svg');
  mask-size: cover;
  background: var(--social-btn-background);

  /* TODO: master delete dark theme */
  &.dark {
    background: $grey-3;
  }
}
</style>
