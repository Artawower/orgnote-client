<template>
  <app-flex
    class="page"
    :class="{ padding, constrained }"
    column
    :center="centered"
    :align="centered ? 'center' : 'stretch'"
  >
    <slot />
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';

withDefaults(
  defineProps<{
    padding?: boolean;
    constrained?: boolean;
    centered?: boolean;
  }>(),
  {
    centered: false,
  },
);
</script>

<style lang="scss" scoped>
.page {
  @include fit();

  & {
    background: var(--bg);
    position: relative;
  }

  &.padding {
    padding: var(--page-padding);
  }

  &.constrained {
    max-width: var(--page-max-width);
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
