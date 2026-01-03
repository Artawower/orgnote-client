<template>
  <div class="safe-area" :class="{ enabled, fit }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    enabled?: boolean;
    /* Safe area will occupy 100% width */
    fit?: boolean;
  }>(),
  {
    enabled: true,
    fit: false,
  },
);
</script>

<style lang="scss" scoped>
.safe-area {
  &.enabled {
    padding-top: max(env(safe-area-inset-top, 0px), var(--title-bar-height, 0px));
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 0);
  }

  &.fit {
    @include fit;
  }

  & {
    min-height: 0;
    box-sizing: border-box;
  }
}
</style>
