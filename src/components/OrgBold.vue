<template>
  <b>
    <content-renderer
      v-for="(c, i) of node.children"
      :key="i"
      :node="c"
    ></content-renderer>
  </b>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');
</script>
