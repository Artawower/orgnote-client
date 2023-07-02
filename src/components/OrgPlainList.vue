<template>
  <component :is="parentListTag">
    <li v-for="(c, i) in node.children" v-bind:key="i">
      <content-renderer v-if="c.title" :node="c.title"></content-renderer>
      <content-renderer v-if="c.section" :node="c.section"></content-renderer>
    </li>
  </component>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { defineComponent, toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');
// const parentListTag = props.node.listType === 'ordered' ? 'ol' : 'ul';
const parentListTag = 'ul';
</script>
