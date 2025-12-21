<template>
  <card-wrapper padding>
    <pre class="app-code"><slot>{{ code }}</slot></pre>
  </card-wrapper>
</template>

<script setup lang="ts">
import CardWrapper from 'src/components/CardWrapper.vue';

defineProps<{
  code?: string;
}>();
</script>

<style lang="scss" scoped>
.app-code {
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  overflow-x: auto;
  background: transparent;
}
</style>
