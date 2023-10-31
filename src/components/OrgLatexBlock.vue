<template>
  <component
    :is="container"
    class="latex"
    v-katex:display="latexFormula"
  ></component>
</template>

<script setup lang="ts">
import { NodeType, OrgNode } from 'org-mode-ast';

import { computed, toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
  container?: 'string';
}>();

const node = toRef(props, 'node');
const formulaIndex = computed(() =>
  node.value.is(NodeType.LatexFragment) ? 1 : 2
);
const latexFormula = computed(() =>
  node.value.children
    ? node.value.children.get(formulaIndex.value).rawValue
    : node.value.value
);
const container = computed(() => props.container ?? 'div');
</script>

<style lang="scss">
.latex {
  width: calc(100% - 2px);
  overflow: auto;
}
.katex-display {
  padding: 0;
  margin: 0;
}
</style>
