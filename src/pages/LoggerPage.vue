<template>
  <div class="logger-page">
    <div class="system-info">
      <code-block :code="prettyLogs" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { userLoggerStore } from 'src/stores';

import CodeBlock from 'src/components/ui/CodeBlock.vue';

const { prettyLogs } = storeToRefs(userLoggerStore());
</script>

<style lang="scss" scoped>
.logger-page {
  padding: var(--default-block-padding);
}
</style>
