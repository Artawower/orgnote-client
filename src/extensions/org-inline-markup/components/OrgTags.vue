<template>
  <span class="org-tags">
    <span v-for="tag in tags" :key="tag" class="org-tag">{{ tag }}</span>
  </span>
</template>

<script lang="ts" setup>
import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import { computed } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const tags = computed<string[]>(() =>
  props.node.children?.filter((n) => n.is(NodeType.Text)).map((n) => n.value) ?? []
);
</script>

<style lang="scss" scoped>
.org-tags {
  display: inline-flex;
  gap: 4px;
}

.org-tag {
  background: var(--base7);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
</style>
