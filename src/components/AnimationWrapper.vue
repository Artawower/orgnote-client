<template>
  <transition v-if="config.ui.enableAnimations" :name="animationName" :mode="mode" :css="css">
    <slot />
  </transition>
  <slot v-else />
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'src/stores/settings';

withDefaults(
  defineProps<{
    animationName?: 'bounce';
    mode?: 'in-out' | 'out-in';
    css?: boolean;
  }>(),
  {
    animationName: 'bounce',
    mode: 'out-in',
    css: true,
  },
);

const { config } = useSettingsStore();
</script>

<style scoped>
.bounce-enter-active,
.bounce-leave-active {
  transition:
    transform 0.1s ease,
    opacity 0.1s ease;
}

.bounce-enter-from {
  transform: scale(0.5) rotate(-90deg);
  opacity: 0;
}

.bounce-enter-to {
  transform: scale(1) rotate(0);
  opacity: 1;
}

.bounce-leave-from {
  transform: scale(1) rotate(0);
  opacity: 1;
}

.bounce-leave-to {
  transform: scale(0.5) rotate(90deg);
  opacity: 0;
}
</style>
