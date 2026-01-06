<template>
  <div class="safe-area" :class="classes">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    top?: boolean;
    bottom?: boolean;
  }>(),
  {
    top: false,
    bottom: false,
  },
);

const hasExplicitInsets = computed(() => props.top || props.bottom);

const classes = computed(() => ({
  top: !hasExplicitInsets.value || props.top,
  bottom: !hasExplicitInsets.value || props.bottom,
}));
</script>

<style lang="scss" scoped>
.safe-area {
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  min-height: 0;
  box-sizing: border-box;

  &.top {
    padding-top: max(env(safe-area-inset-top, 0px), var(--title-bar-height, 0px));
  }

  &.bottom {
    padding-bottom: var(--device-padding-bottom, env(safe-area-inset-bottom, 0px));
  }
}

:global(body.keyboard-opened) .safe-area.bottom {
  padding-bottom: 0;
}
</style>
