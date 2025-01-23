<template>
  <div class="page" :class="{ padding }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  padding?: boolean;
}>();
</script>

<style lang="scss" scoped>
.page {
  @include fit();
  @include flexify(row, flex-start, flex-start);

  background: var(--bg);
  padding-bottom: var(--footer-height);

  &.padding {
    padding: var(--page-padding);
  }
}
</style>
