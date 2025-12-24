<template>
  <app-link :href="linkAddress" class="org-link">
    {{ displayText }}
  </app-link>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import AppLink from 'src/components/AppLink.vue';
import { computed, toRef } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const node = toRef(props, 'node');

const extractLink = (raw: string): string => {
  const match = raw.match(/\[\[([^\]]+)\]/);
  return match?.[1] ?? raw;
};

const rawLink = computed(() => node.value.children?.get(1)?.children?.get(1)?.value ?? '');
const linkAddress = computed(() => extractLink(rawLink.value));

const linkNameNode = computed(() =>
  (node.value.children?.length ?? 0) === 4 ? node.value.children?.get(2) : null,
);

const displayText = computed(
  () => linkNameNode.value?.children?.get(1).rawValue ?? linkAddress.value,
);
</script>
