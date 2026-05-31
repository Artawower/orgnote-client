<template>
  <div class="buffer-content" :class="{ 'no-padding-bottom': noPaddingBottom }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ noPaddingBottom?: boolean }>();
</script>

<style lang="scss" scoped>
.buffer-content {
  height: 100%;
  box-sizing: border-box;

  @include tablet-below {
    padding-top: var(--main-header-total-height);
    padding-bottom: var(--floating-padding-bottom);

    &.no-padding-bottom {
      padding-bottom: 0;
    }
  }
}
</style>
