<template>
  <div class="action-buttons" :class="{ vertical, horizontal }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  vertical?: boolean;
  horizontal?: boolean;
}>();
</script>

<style lang="scss" scoped>
.action-buttons {
  @include flexify(row, flex-start, center, var(--gap-sm));
}

.vertical {
  flex-direction: column;
}

.horizontal {
  flex-direction: row;
}
</style>
