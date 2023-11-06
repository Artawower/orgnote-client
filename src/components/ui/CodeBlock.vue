<template>
  <div class="src-code-wrapper">
    <action-btn @click="copySrc" icon="content_copy" active-icon="done" />
    <highlightjs autodetect :code="code" />
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard } from 'quasar';

import ActionBtn from './ActionBtn.vue';

const props = defineProps<{
  code: string;
}>();

const copySrc = () => {
  copyToClipboard(props.code);
};
</script>

<style lang="scss" scoped>
.src-code-wrapper {
  position: relative;

  .action-btn {
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
