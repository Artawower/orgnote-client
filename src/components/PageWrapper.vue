<template>
  <app-flex class="page" :class="{ padding, constrained }" column start align-start>
    <slot />
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';

defineProps<{
  padding?: boolean;
  constrained?: boolean;
}>();
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
