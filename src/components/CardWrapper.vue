<template>
  <div class="card-wrapper" :class="[{ padding, border }, type]">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { CardType } from 'src/models/card-type';

withDefaults(
  defineProps<{
    padding?: boolean;
    border?: boolean;
    type?: CardType;
  }>(),
  {
    padding: false,
    border: false,
    type: 'simple',
  },
);
</script>

<style lang="scss">
.card-wrapper {
  border-radius: var(--card-border-radius);
  clip-path: inset(0 round var(--card-border-radius));
  /* overflow: hidden; */
  width: 100%;

  &.padding {
    padding: var(--card-padding);
  }

  &.border {
    border: var(--card-border);
  }

  $type-colors: (
    info: var(--blue),
    warning: var(--yellow),
    danger: var(--red),
  );

  &.simple {
    background: var(--bg-alt2);
  }

  @each $type, $color in $type-colors {
    &.#{$type} {
      background: color-mix(in srgb, $color, var(--bg) 80%) !important;
      border-color: $color;

      ::v-deep(li::marker) {
        color: color-mix(in srgb, $color, var(--bg) 40%) !important;
      }
    }
  }
}
</style>
