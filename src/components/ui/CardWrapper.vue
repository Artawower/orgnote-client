<template>
  <div class="card-wrapper" :class="[size, type, roundBorders]">
    <slot />
  </div>
</template>

<script lang="ts">
export interface CardWrapperProps {
  disabled?: boolean;
  roundBorders: 'top' | 'bottom' | 'full' | 'none';
  size: 'small' | 'medium' | 'large';
  type?: 'action';
}
</script>

<script lang="ts" setup>
withDefaults(defineProps<CardWrapperProps>(), {
  roundBorders: 'none',
  size: 'small',
});
</script>

<style lang="scss">
.card-wrapper {
  @include flexify(row, space-between, center, var(--gap-md));
  cursor: pointer;
  height: var(--menu-item-height);
  padding: var(--block-padding-sm);

  &.large {
    height: auto;
    max-height: var(--menu-item-max-height);
  }

  &.full {
    border-radius: var(--block-border-radius-md);
  }

  &.top {
    border-top-left-radius: var(--block-border-radius-md);
    border-top-right-radius: var(--block-border-radius-md);
  }

  &.bottom {
    border-bottom-left-radius: var(--block-border-radius-md);
    border-bottom-right-radius: var(--block-border-radius-md);
  }

  &:hover {
    background-color: var(--base7);

    .slot-actions {
      display: flex !important;
    }
  }
}
</style>
