<template>
  <button :class="{ size, active }">
    <q-icon :name="icon" :size="size" />
  </button>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    icon: string;
    active?: boolean;
    size?: 'sm' | 'md' | 'lg';
    fireIcon?: string;
    fireColor?: string;
  }>(),
  {
    active: false,
    size: 'md',
  },
);
</script>

<style lang="scss" scoped>
button {
  @include flexify(row, center, center);
  padding: var(--btn-action-padding);
  border-radius: var(--btn-action-radius);
  color: var(--btn-action-color);
  background: var(--btn-action-bg);
  cursor: pointer;
  border: var(--btn-action-border);

  &.sm {
    width: var(--btn-action-sm-size);
    height: var(--btn-action-sm-size);
  }

  &.md {
    width: var(--btn-action-md-size);
    height: var(--btn-action-md-size);
  }

  &.lg {
    width: var(--btn-action-lg-size);
    height: var(--btn-action-lg-size);
  }

  &:hover,
  &:active {
    background: var(--btn-action-hover-bg);
    filter: brightness(var(--btn-action-hover-brightness));
  }

  .active {
    background: var(--btn-action-active-bg);
    color: var(--btn-action-active-color);
  }
}
</style>
