<template>
  <q class="org-quote">
    <p v-for="(n, i) in node?.children" :key="i">
      <content-renderer :node="n"></content-renderer>
    </p>
  </q>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';

import { defineComponent, toRef } from 'vue';

import ContentRenderer from 'src/components/ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
}>();

defineComponent({
  ContentRenderer,
});

const node = toRef(props, 'node');
</script>

<style scoped lang="scss">
.org-quote {
  display: block;
  border-left: 3px solid var(--base8);
  padding-left: var(--block-padding-md);
  font-style: italic;

  &::before {
    content: '';
  }

  &::after {
    content: '';
  }
}
</style>
