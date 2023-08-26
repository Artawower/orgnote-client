<template>
  <a
    :href="linkType === 'image' ? buildMediaFilePath(linkAddress) : linkAddress"
    target="_blank"
  >
    <img
      class="image-preview"
      v-if="linkType === 'image'"
      :src="buildMediaFilePath(linkAddress)"
    />
    <template v-else>
      <content-renderer v-if="linkNameNode" :node="linkNameNode" />
      <template v-else>
        {{ linkAddress }}
      </template>
    </template>
  </a>
</template>

<script setup lang="ts">
import { defineComponent, toRef } from 'vue';

import { OrgNode } from 'org-mode-ast';

import ContentRenderer from './ContentRenderer.vue';
import { buildMediaFilePath } from 'src/tools';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const linkAddress = node.value.children.get(1).children.get(1).value;
const linkNameNode =
  node.value.children.length === 4 ? node.value.children.get(2) : null;

const linkType = node.value.meta?.linkType;
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

.image-preview {
  max-width: 100% !important;
}
</style>
