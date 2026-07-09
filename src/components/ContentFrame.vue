<template>
  <app-flex
    class="content-frame"
    :class="{ constrained, padding }"
    column
    :justify="justify"
    :center="centered"
    :align="centered ? 'center' : 'stretch'"
    :full-height="fullHeight"
    full-width
  >
    <slot />
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';
import type { AppFlexJustify } from './app-flex.types';

withDefaults(
  defineProps<{
    constrained?: boolean;
    padding?: boolean;
    centered?: boolean;
    fullHeight?: boolean;
    justify?: AppFlexJustify;
  }>(),
  {
    justify: 'start',
  },
);
</script>

<style lang="scss" scoped>
.content-frame {
  min-width: 0;
  box-sizing: border-box;

  &.padding {
    padding: var(--content-frame-padding, var(--page-padding));
  }

  &.constrained {
    max-width: var(--content-frame-max-width, var(--content-max-width));
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
