<template>
  <div role="button" class="icon-btn cursor-pointer" :class="{ hoverable }">
    <q-icon :name="name" :size="size" />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    name: string;
    size?: string;
    hoverable?: boolean;
  }>(),
  {
    size: 'sm',
    hoverable: true,
  }
);
</script>

<style lang="scss" scoped>
.icon-btn {
  color: var(--icon-btn-color);

  &.hoverable:hover {
    color: var(--icon-btn-hover-color);
  }
}
</style>
