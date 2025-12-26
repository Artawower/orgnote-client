<template>
  <blockquote class="org-quote">
    <p v-for="(child, i) in quoteChildren" :key="i">
      <content-renderer :node="child" />
    </p>
  </blockquote>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed } from 'vue';
import ContentRenderer from 'src/components/ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
  nodeGetter?: () => OrgNode;
}>();

const currentNode = computed(() => props.nodeGetter?.() ?? props.node);
const quoteChildren = computed(() => currentNode.value?.children ?? []);
</script>

<style scoped lang="scss">
.org-quote {
  display: block;
  border-left: 3px solid var(--accent);
  padding-left: var(--padding-md);
  margin: 0;
  font-style: italic;

  p {
    margin: 0;
  }
}
</style>
