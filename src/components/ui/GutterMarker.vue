<template>
  <q-icon
    name="expand_more"
    size="sm"
    class="text-bold fold-gutter"
    :class="{ closed: !open, disabled }"
  ></q-icon>
</template>

<script lang="ts" setup>
defineProps<{
  open: boolean;
  disabled?: boolean;
}>();
</script>

<style lang="scss" scoped>
.closed {
  transform: rotate(-90deg);
}

.fold-gutter {
  &:hover {
    color: var(--base8);
  }
  &.disabled,
  &disabled:hover {
    color: var(--base5);
  }
}
</style>
