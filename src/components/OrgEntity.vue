<template>
  <span class="org-entity">{{ node.value }}</span>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

defineProps<{
  node: OrgNode;
  rootNodeSrc: () => OrgNode;
  readonly?: boolean;
}>();
</script>

<style lang="scss" scoped>
.org-entity {
  color: var(--orange);
}
</style>
