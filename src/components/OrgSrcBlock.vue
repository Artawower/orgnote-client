<template>
  <div class="src-code-wrapper">
    <action-btn @click="copySrc" icon="content_copy" active-icon="done" />
    <highlightjs :autodetect="true" :code="node?.children.get(2)?.rawValue" />
  </div>
</template>

<script setup lang="ts">
import ActionBtn from './ui/ActionBtn.vue';
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
  copyToClipboard(node.value.children.get(2).rawValue);
};
</script>

<style lang="scss">
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

  .copy-btn.copied {
    display: flex;
  }
}
</style>
