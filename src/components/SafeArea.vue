<template>
  <div class="safe-area" :class="{ enabled }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    enabled?: boolean;
  }>(),
  {
    enabled: true,
  },
);
</script>

<style lang="scss" scoped>
.safe-area {
  &.enabled {
    padding-top: env(safe-area-inset-top);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  & {
    height: 100%;
    padding-bottom: env(safe-area-inset-bottom);
    box-sizing: border-box;
  }
}
</style>
