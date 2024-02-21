<template>
  <span class="org-priority" :class="`org-priority-${priorityLevel}`">
    <q-icon :name="icon" size="sm"> </q-icon>
  </span>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

import { computed } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const icons: { [key: string]: string } = {
  '#A': 'looks_one',
  '#B': 'looks_two',
  '#C': 'looks_3',
  '#D': 'looks_4',
  '#E': 'looks_5',
  '#F': 'looks_6',
};

const priority = computed(() => props.node.children.get(1).value);

const icon = icons[priority.value.toUpperCase()];

const priorityLevel =
  (Object.keys(icons).indexOf(priority.value.toUpperCase()) ?? 0) + 1;
</script>

<style lang="scss" scoped>
.org-priority {
  position: relative;
  display: inline-block;
  bottom: 2px;
}
</style>
