<template>
  <component :is="tag" class="org-text">
    {{ node.value }}
  </component>
</template>

<script setup lang="ts">
import { NodeType, OrgNode } from 'org-mode-ast';
import { ref, toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const tag = node.value.parent.is(
  NodeType.Root,
  NodeType.ListItem,
  NodeType.Section,
  NodeType.Headline
)
  ? 'p'
  : 'span';

// const isParagraph = ref(
// );
</script>

<style lang="scss">
.org-text {
  white-space: pre;
}
</style>
