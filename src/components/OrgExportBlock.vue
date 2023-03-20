<template>
  <div class="latex" v-katex:display="node.value"></div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');
</script>
