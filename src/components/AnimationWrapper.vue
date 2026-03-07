<template>
  <transition :name="transitionName" :mode="transitionMode" :css="shouldUseCss">
    <slot />
  </transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useConfigStore } from 'src/stores/config';

const props = withDefaults(
  defineProps<{
    animationName?: 'bounce' | 'expand' | 'fade';
    mode?: 'in-out' | 'out-in';
    css?: boolean;
  }>(),
  {
    animationName: 'fade',
    mode: 'out-in',
    css: true,
  },
);

const { config } = useConfigStore();

const shouldUseCss = computed(() => config.ui.enableAnimations && props.css);
const transitionMode = computed(() => (config.ui.enableAnimations ? props.mode : undefined));
const transitionName = computed(() =>
  config.ui.enableAnimations ? props.animationName : undefined,
);
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

.expand-enter-active,
.expand-leave-active {
  display: grid;
  grid-template-rows: 1fr;
  transition:
    grid-template-rows 0.3s ease,
    opacity 0.3s ease;
}

.expand-enter-active > *,
.expand-leave-active > * {
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  grid-template-rows: 1fr;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
