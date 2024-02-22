<template>
  <tag-list :tags="tags" :inline="false"></tag-list>
</template>

<script lang="ts" setup>
import { NodeType, OrgNode } from 'org-mode-ast';

import { computed } from 'vue';

import TagList from 'src/components/TagList.vue';

const props = defineProps<{
  node: OrgNode;
}>();

const tags = computed<string[]>(() =>
  props.node.children.filter((n) => n.is(NodeType.Text)).map((n) => n.value)
);
</script>
