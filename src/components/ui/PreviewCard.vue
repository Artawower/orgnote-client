<template>
  <div class="card">
    <slot v-if="isDefaultSlotProvided" />
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';

const slots = useSlots();

defineProps<{
  title?: string;
  titleIcon?: string;
  interactive?: boolean;
}>();

const isDefaultSlotProvided = slots.default !== undefined;
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  border: 1px solid var(--base7);
  border-radius: var(--block-border-radius-sm);
  padding: var(--block-padding-md);
}
</style>
