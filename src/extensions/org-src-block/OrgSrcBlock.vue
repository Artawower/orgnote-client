<template>
  <div class="src-code-wrapper">
    <highlightjs autodetect :code="codeContent" />
  </div>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed } from 'vue';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import { getSrcBlockCode } from './src-block-node';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  node: OrgNode;
  nodeGetter?: () => OrgNode;
}>();

const currentNode = computed(() => props.nodeGetter?.() ?? props.node);
const codeContent = computed(() => getSrcBlockCode(currentNode.value));
</script>

<style lang="scss" scoped>
.src-code-wrapper {
  pre {
    margin: 0 !important;

    code {
      padding: var(--src-block-padding-y, var(--padding-md))
        var(--src-block-padding-x, var(--padding-md));
      border-radius: var(--border-radius-sm);
    }
  }
}
</style>
