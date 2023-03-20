<template>
  {{ node.children.last.rawValue }}
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { toRefs } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const { node } = toRefs(props);
</script>
