<template>
  <q-icon name="expand_more" size="sm" :class="{ closed: !open }"></q-icon>
</template>

<script lang="ts" setup>
defineProps<{
  open: boolean;
}>();
</script>

<style lang="scss" scoped>
.closed {
  transform: rotate(-90deg);
}
</style>
