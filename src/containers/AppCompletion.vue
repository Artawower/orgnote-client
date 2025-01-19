<template>
  <div class="completion-wrapper">
    <div class="header">
      <completion-input :model-value="searchText" :placeholder="placeholder" />
    </div>
    <div class="content"></div>
    <div class="footer"></div>
  </div>
</template>

<script lang="ts" setup>
import type { CompletionConfig } from 'orgnote-api';
import CompletionInput from './CompletionInput.vue';
defineProps<
  {
    placeholder?: string;
  } & CompletionConfig
>();
</script>

<style lang="scss" scoped>
.completion-wrapper {
  max-width: var(--completion-max-width);
  width: var(--completion-width) !important;
}

.header {
  border-bottom: var(--border-default);
  padding: var(--completion-padding);
}

.footer {
  height: var(--completion-footer-height);
}
</style>
