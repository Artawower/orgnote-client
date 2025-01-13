<template>
  <div v-if="isVisible">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { getNumericCssVar } from 'src/utils/css-utils';
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  condition:
    | 'desktop'
    | 'desktop-above'
    | 'desktop-below'
    | 'tablet-below'
    | 'tablet-above'
    | 'mobile';
}>();

const screenWidth = ref(window.innerWidth);

const breakpoints = {
  tablet: getNumericCssVar('--tablet'),
  desktop: getNumericCssVar('--desktop'),
};

const conditions = {
  desktop: () => screenWidth.value >= breakpoints.desktop,
  'desktop-above': () => screenWidth.value > breakpoints.desktop,
  'desktop-below': () => screenWidth.value < breakpoints.desktop,
  'tablet-below': () => screenWidth.value < breakpoints.tablet,
  'tablet-above': () => screenWidth.value >= breakpoints.tablet,
  mobile: () => screenWidth.value < breakpoints.tablet,
};

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

const isVisible = computed(() => conditions[props.condition]?.() ?? false);
</script>
