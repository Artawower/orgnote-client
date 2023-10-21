<template>
  <dynamic-tooltip position="bottom">
    <template v-slot:content>
      <span class="org-date">
        {{ node.rawValue }}
      </span>
    </template>
    <template v-slot:tooltip>
      <q-date
        v-model="date"
        landscape
        flat
        readonly
        format-md
        mask="YYYY-MM-DD"
      />
    </template>
  </dynamic-tooltip>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

import { computed } from 'vue';

import DynamicTooltip from './ui/DynamicTooltip.vue';

const props = defineProps<{
  node: OrgNode;
  rootNodeSrc: () => OrgNode;
}>();

defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const date = computed(
  () => props.node.children.get(1).rawValue?.split(' ')?.[0]
);
</script>

<style lang="scss" scoped>
.org-date {
  color: var(--yellow);
  font-weight: 500;
  cursor: pointer;
}
</style>
