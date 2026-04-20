<template>
  <button
    :class="{ outline, [type]: type }"
    class="text-medium"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
import type { StyleVariant } from 'orgnote-api';

withDefaults(
  defineProps<{
    type?: StyleVariant;
    outline?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: 'plain',
  },
);
</script>

<style lang="scss" scoped>
$type-colors: (
  plain: var(--bg-elevated),
  active: var(--accent),
  info: var(--blue),
  warning: var(--yellow),
  danger: var(--red),
);

button {
  border: none;
  border-radius: var(--button-radius);
  padding: var(--button-padding);
  min-width: var(--button-min-width);
  box-sizing: border-box;

  @each $type, $color in $type-colors {
    &.#{$type} {
      &:not(.outline) {
        background: color-mix(in srgb, $color, var(--bg) 15%) !important;
      }

      &.outline {
        background: var(--bg);
        border: 1px solid $color;
        color: var(--fg);
      }

      color: var(--bg);

      @include hover {
        background: color-mix(in srgb, $color, var(--bg) 5%) !important;
      }
    }
  }

  &.plain {
    color: var(--fg);
  }

  &.link {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    min-width: unset;
    color: var(--accent);
    cursor: pointer;
    font: inherit;
    text-decoration: none;

    @include hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: none;
      text-decoration: underline;
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }
}
</style>
