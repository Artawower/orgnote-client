<template>
  <div class="src-code-wrapper">
    <action-btn @click="copySrc" icon="content_copy" active-icon="done" />
    <highlightjs
      autodetect
      :code="node?.children?.get(2)?.rawValue ?? node?.rawValue"
    />
  </div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { copyToClipboard } from 'quasar';

import { toRef } from 'vue';

import ActionBtn from './ui/ActionBtn.vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const copySrc = () => {
  copyToClipboard(node.value.children.get(2).rawValue);
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
  pre {
    margin: 0 !important;

    code {
      padding: var(--src-block-padding-y) var(--src-block-padding-x);
      border-radius: var(--sm-block-border-radius);
    }
  }
}
</style>
