<template>
  <div class="card-wrapper" :class="[{ padding, border }, type]">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { ViewType } from 'src/models/card-type';

withDefaults(
  defineProps<{
    padding?: boolean;
    border?: boolean;
    type?: ViewType;
  }>(),
  {
    padding: false,
    border: false,
    type: 'plain',
  },
);
</script>

<style lang="scss">
.card-wrapper {
  & {
    border-radius: var(--card-border-radius);
    clip-path: inset(0 round var(--card-border-radius));
    width: 100%;
  }

  &.padding {
    padding: var(--card-padding);
  }

  &.border {
    border: var(--card-border);
  }

  &.plain {
    background: var(--bg-alt2);
  }

  &.clear {
    background: transparent;
  }

  @include for-each-view-type using ($type, $color) {
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
