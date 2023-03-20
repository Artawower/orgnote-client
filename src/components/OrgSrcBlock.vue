<template>
  <div class="src-code-wrapper">
    <copy-btn @copied="copySrc" />
    <highlightjs :autodetect="true" :code="node?.children.get(2)?.rawValue" />
  </div>
</template>

<script setup lang="ts">
import CopyBtn from './CopyBtn.vue';
import { toRef } from 'vue';

import 'highlight.js/lib/common';
import 'highlight.js/styles/stackoverflow-light.css';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import { copyToClipboard } from 'quasar';
import { OrgNode } from 'org-mode-ast';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const copySrc = () => {
  copyToClipboard(node.value.value);
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
