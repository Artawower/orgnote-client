<template>
  <div class="description capitalize">
    <template v-if="text">{{ text }}</template>

    <slot v-else />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ text?: string }>();
</script>

<style lang="scss" scoped>
.description {
  color: var(--fg-alt);
  font-size: var(--font-size-sm);
  margin: var(--block-margin-md);
}
</style>
