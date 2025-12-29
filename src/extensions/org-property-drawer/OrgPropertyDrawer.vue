<template>
  <app-flex class="org-property-drawer" between align-center>
    <span class="org-property-drawer-info line-limit-1">
      <template v-if="nodeId">id: {{ nodeId }}</template>
    </span>
  </app-flex>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed } from 'vue';
import AppFlex from 'src/components/AppFlex.vue';

const props = defineProps<{
  node: OrgNode;
  nodeGetter?: () => OrgNode;
}>();

const currentNode = computed(() => props.nodeGetter?.() ?? props.node);
const nodeId = computed(() => currentNode.value.parent?.meta?.id);
</script>

<style lang="scss" scoped>
.org-property-drawer {
  width: 100%;
  border-bottom: var(--border-default);
  padding: var(--padding-md) 0;
  box-sizing: border-box;
}

.org-property-drawer-info {
  color: var(--fg-muted);
  font-size: var(--font-size-sm);
}
</style>
