<template>
  <s>
    <content-renderer :node="content"></content-renderer>
  </s>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  content: OrgNode;
}>();

const content = toRef(props, 'content');
</script>
