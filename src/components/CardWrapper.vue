<template>
  <div
    class="card-wrapper"
    :class="{ padding, border }"
    :style="{ 'background-color': background }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    padding?: boolean;
    border?: boolean;
    background?: string;
  }>(),
  {
    padding: false,
    border: false,
    background: 'var(--bg)',
  },
);
</script>

<style lang="scss">
.card-wrapper {
  border-radius: var(--card-border-radius);
  overflow: hidden;

  &.padding {
    padding: var(--card-padding);
  }

  &.border {
    border: var(--card-border);
  }
}
</style>
