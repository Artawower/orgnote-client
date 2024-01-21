<template>
  <div
    role="button"
    class="icon-btn cursor-pointer"
    :class="[{ hoverable }, childClass]"
  >
    <slot name="prepend" />
    <q-icon :name="name" :size="size">
      <slot name="menu" />
    </q-icon>
    <slot name="append" />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    name: string;
    size?: string;
    hoverable?: boolean;
    childClass?: string;
  }>(),
  {
    size: 'sm',
    hoverable: true,
    childClass: '',
  }
);
</script>

<style lang="scss" scoped>
.icon-btn {
  @include flexify(row, flex-start, center);
  white-space: nowrap;
  color: var(--icon-btn-color);
  gap: var(--gap-sm);

  &.hoverable:hover {
    color: var(--icon-btn-hover-color);
  }
}
</style>
