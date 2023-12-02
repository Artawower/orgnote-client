<template>
  <div class="src-code-wrapper">
    <div v-if="code.length" class="actions">
      <slot name="actions" />
      <action-btn @click="copySrc" icon="content_copy" active-icon="done" />
    </div>
    <highlightjs autodetect :code="code" />
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from 'quasar';

import ActionBtn from 'src/components/ui/ActionBtn.vue';

const props = defineProps<{
  code: string;
}>();

const copySrc = () => {
  copyToClipboard(props.code);
};
</script>

<style lang="scss" scoped>
.actions {
  @include flexify();
  gap: var(--small-gap);
}
.src-code-wrapper {
  position: relative;

  .actions {
    position: absolute;
    right: 10px;
    top: 8px;
    display: none;
  }

  &:hover {
    .action-btn {
      display: flex;
    }
  }
}
</style>
