<template>
  <span class="org-date" :class="{ expired }">{{ node.rawValue }}</span>
</template>

<script lang="ts" setup>
import type { OrgNode } from 'org-mode-ast';
import { computed } from 'vue';

const props = defineProps<{
  node: OrgNode;
  readonly?: boolean;
}>();

defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const rawDate = computed(() => props.node.children?.get(1)?.rawValue ?? '');
const date = computed(() => new Date(rawDate.value.split(' ')[0] ?? ''));
const expired = computed(() => new Date() > date.value);
</script>

<style lang="scss" scoped>
.org-date {
  color: var(--yellow);
  font-weight: 500;
  cursor: pointer;

  &.expired {
    color: var(--red);
  }
}
</style>
