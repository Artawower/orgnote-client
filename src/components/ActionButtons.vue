<template>
  <div class="action-buttons" :class="[{ vertical, horizontal }, `${position}`]">
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    vertical?: boolean;
    horizontal?: boolean;
    position?: 'left' | 'right' | 'center';
  }>(),
  {
    position: 'left',
  },
);
</script>

<style lang="scss" scoped>
.action-buttons {
  @include flexify(row, flex-start, center, var(--gap-sm));
}

.left {
  justify-content: flex-start;
}

.right {
  justify-content: flex-end;
}

.center {
  justify-content: center;
}

.vertical {
  flex-direction: column;
}

.horizontal {
  flex-direction: row;
}
</style>
