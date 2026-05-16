<template>
  <div class="buffer-content" :class="{ 'no-top': noTop, 'no-bottom': noBottom }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    noTop?: boolean;
    noBottom?: boolean;
  }>(),
  {
    noTop: false,
    noBottom: false,
  },
);
</script>

<style lang="scss" scoped>
.buffer-content {
  height: 100%;
  box-sizing: border-box;

  @include tablet-below {
    padding-top: var(--main-header-total-height);
    padding-bottom: var(--floating-padding-bottom);

    &.no-top {
      padding-top: 0;
    }

    &.no-bottom {
      padding-bottom: 0;
    }
  }
}
</style>
