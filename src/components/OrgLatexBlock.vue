<template>
  <div class="latex" v-katex:display="latexFormula"></div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';

import { computed, toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');
const latexFormula = computed(() => node.value.children.get(2).rawValue);
</script>

<style lang="scss">
.latex {
  width: calc(100% - 2px);
}
</style>
