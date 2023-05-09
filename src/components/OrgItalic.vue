<template>
  <i>
    <content-renderer :node="content"></content-renderer>
  </i>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
}>();

const content = toRef(props, 'node');
</script>
