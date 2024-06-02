<template>
  <p class="org-paragraph">
    <template v-for="(n, i) in node.children" :key="i">
      <org-link v-if="n.type === 'link'" :node="n"></org-link>
      <org-src-inline-code
        v-else-if="n.type === 'verbatim'"
        :node="n"
      ></org-src-inline-code>
      <span v-else>
        <content-renderer :node="n" :key="i"></content-renderer>
      </span>
    </template>
  </p>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';

import { defineComponent, toRef } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import OrgLink from 'src/components/extensions/OrgLink.vue';
import OrgSrcInlineCode from './OrgSrcInlineCode.vue';

const props = defineProps<{
  node: OrgNode;
}>();

defineComponent({
  ContentRenderer,
  OrgLink,
  OrgSrcInlineCode,
});

const node = toRef(props, 'node');
</script>

<style lang="scss" scoped>
.org-paragraph {
  white-space: pre-wrap;
}
</style>
