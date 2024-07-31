<template>
  <div class="description capitalize">
    <slot>
      <template v-if="text"
        >{{ title ? $t(text).toUpperCase() : $t(text) }}
      </template>
    </slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ text?: string; title?: boolean }>();
</script>

<style lang="scss" scoped>
.description {
  color: var(--fg-alt);
  font-size: var(--font-size-sm);
}
</style>
