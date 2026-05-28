<template>
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConfigStore } from 'src/stores/config';

const { config } = useConfigStore();
const animationsEnabled = computed(() => config.ui.enableAnimations);

const onBeforeEnter = (el: Element): void => {
  if (!animationsEnabled.value) return;
  (el as HTMLElement).style.height = '0';
  (el as HTMLElement).style.overflow = 'hidden';
};

const onEnter = (el: Element, done: () => void): void => {
  if (!animationsEnabled.value) {
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
  (el as HTMLElement).style.height = '';
  (el as HTMLElement).style.overflow = '';
};

const onBeforeLeave = (el: Element): void => {
  if (!animationsEnabled.value) return;
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = `${htmlEl.scrollHeight}px`;
  htmlEl.style.overflow = 'hidden';
};

const onLeave = (el: Element, done: () => void): void => {
  if (!animationsEnabled.value) {
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
