<template>
  <a :href="linkAddress" target="_blank">
    <content-renderer :node="linkNameNode" />
  </a>
</template>

<script setup lang="ts">
import { defineComponent, toRef } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import { OrgNode } from 'org-mode-ast';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const linkAddress = node.value.children.get(1).children.get(2).value;

const linkNameNode = node.value.children.get(2);

</script>

<style lang="scss">
.org-image {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.preview-tooltip {
  padding: 0;
}
</style>
