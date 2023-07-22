<template>
  <code class="inline-code">
    <content-renderer v-for="(n, i) of node.children" :node="n" :key="i" />
  </code>
</template>

<script setup lang="ts">
import ContentRenderer from 'src/components/ContentRenderer.vue';
import { toRef } from 'vue';
import { OrgNode } from 'org-mode-ast';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');
</script>

<style lang="scss">
.inline-code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  border-radius: 6px;
  background-color: var(--inline-code-background);
  color: var(--inline-code-font-color);
}
</style>
