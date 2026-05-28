<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    :css="shouldUseCss"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  >
    <slot />
  </transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useConfigStore } from 'src/stores/config';

const props = withDefaults(
  defineProps<{
    animationName?: 'bounce' | 'fade' | 'slide';
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

const isSlide = computed(() => props.animationName === 'slide');
const animationsEnabled = computed(() => config.ui.enableAnimations);
const shouldUseCss = computed(() => !isSlide.value && animationsEnabled.value && props.css);
const transitionMode = computed(() => (animationsEnabled.value ? props.mode : undefined));
const transitionName = computed(() =>
  animationsEnabled.value && !isSlide.value ? props.animationName : undefined,
);

const onBeforeEnter = (el: Element): void => {
  if (!isSlide.value || !animationsEnabled.value) return;
  (el as HTMLElement).style.height = '0';
  (el as HTMLElement).style.overflow = 'hidden';
};

const onEnter = (el: Element, done: () => void): void => {
  if (!isSlide.value || !animationsEnabled.value) {
    done();
    return;
  }
  const htmlEl = el as HTMLElement;
  requestAnimationFrame(() => {
    htmlEl.style.height = `${htmlEl.scrollHeight}px`;
    htmlEl.addEventListener('transitionend', done, { once: true });
  });
};

const onAfterEnter = (el: Element): void => {
  if (!isSlide.value) return;
  (el as HTMLElement).style.height = '';
  (el as HTMLElement).style.overflow = '';
};

const onBeforeLeave = (el: Element): void => {
  if (!isSlide.value || !animationsEnabled.value) return;
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = `${htmlEl.scrollHeight}px`;
  htmlEl.style.overflow = 'hidden';
};

const onLeave = (el: Element, done: () => void): void => {
  if (!isSlide.value || !animationsEnabled.value) {
    done();
    return;
  }
  const htmlEl = el as HTMLElement;
  requestAnimationFrame(() => {
    htmlEl.style.height = '0';
    htmlEl.addEventListener('transitionend', done, { once: true });
  });
};
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
