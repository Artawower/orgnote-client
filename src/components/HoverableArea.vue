<template>
  <component
    :is="tag"
    class="hoverable-area"
    :class="{ 'has-border': bordered, 'actions-visible': persistentActions }"
  >
    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
    <div class="content">
      <slot />
    </div>
  </component>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    tag?: string;
    bordered?: boolean;
    persistentActions?: boolean;
  }>(),
  {
    tag: 'div',
    bordered: true,
    persistentActions: false,
  },
);
</script>

<style lang="scss" scoped>
.hoverable-area {
  position: relative;

  &.has-border {
    @include hoverable-area;
  }

  .actions {
    @include hoverable-actions;
  }

  &:hover .actions,
  &:focus-within .actions,
  &.actions-visible .actions {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>