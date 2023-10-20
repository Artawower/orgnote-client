<template>
  <div class="flex full-width column everything-fine items-center gap-16">
    <q-icon name="sentiment_satisfied" size="4rem" />
    <h5 class="capitalize">{{ text }}</h5>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  text?: string;
}>();
</script>

<style lang="scss" scoped>
.everything-fine {
  color: var(--green);
}
</style>
