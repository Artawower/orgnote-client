<template>
  <div class="description capitalize" :class="type ?? ''">
    <slot>
      <template v-if="text"
        >{{ title ? $t(text).toUpperCase() : $t(text) }}
      </template>
    </slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ text?: string; title?: boolean; type?: 'warning' | 'error' }>();
</script>

<style lang="scss" scoped>
.description {
  color: var(--fg-alt);
  font-size: var(--font-size-sm);
}

.warning {
  color: var(--yellow);
}

.error {
  color: var(--red);
}
</style>
