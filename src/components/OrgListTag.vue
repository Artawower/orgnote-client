<template>
  <tag-list :tags="tags" :with-hash="props.withHash"></tag-list>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

import { computed } from 'vue';

import TagList from 'src/components/TagList.vue';

const props = defineProps<{
  node: OrgNode;
  withHash?: boolean;
}>();

const tags = computed<string[]>(() => [props.node.value]);
</script>
