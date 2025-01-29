<template>
  <button :class="{ outline, [type]: type }" class="text-bold">
    <slot />
  </button>
</template>

<script lang="ts" setup>
import type { ViewType } from 'src/models/card-type';

withDefaults(
  defineProps<{
    type?: ViewType;
    outline?: boolean;
  }>(),
  {
    type: 'plain',
  },
);
</script>

<style lang="scss" scoped>
$type-colors: (
  plain: var(--bg-alt2),
  active: var(--accent),
  info: var(--blue),
  warning: var(--yellow),
  danger: var(--red),
);

button {
  border: none;
  border-radius: var(--button-border-raidius);
  padding: var(--button-padding);
  min-width: var(--button-min-width);

  @each $type, $color in $type-colors {
    &.#{$type} {
      &:not(.outline) {
        background: color-mix(in srgb, $color, var(--bg) 15%) !important;
      }

      &.outline {
        background: var(--bg);
        border-color: $color;
        color: var(--fg);
      }

      color: var(--bg);

      &:hover {
        background: color-mix(in srgb, $color, var(--bg) 5%) !important;
      }
    }
  }

  &.plain {
    color: var(--fg);
  }
}
</style>
