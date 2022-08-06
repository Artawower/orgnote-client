<template>
  <div class="src-code-wrapper">
    <copy-btn @copied="copySrc" />
    <highlightjs :autodetect="true" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import CopyBtn from './CopyBtn.vue';
import { toRef } from 'vue';

import 'highlight.js/lib/common';
import 'highlight.js/styles/stackoverflow-light.css';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import { OrgSrcBlock } from 'src/types/org';
import { copyToClipboard } from 'quasar';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  content: OrgSrcBlock;
}>();

const content = toRef(props, 'content');

const copySrc = () => {
  copyToClipboard(content.value.value);
};
</script>

<style lang="scss">
.src-code-wrapper {
  position: relative;

  .copy-btn {
    position: absolute;
    right: 10px;
    top: 8px;
    display: none;
  }

  &:hover {
    .copy-btn {
      display: flex;
    }
  }

  .copy-btn.copied {
    display: flex;
  }
}
</style>
