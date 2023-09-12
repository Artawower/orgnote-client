<template>
  <a
    :href="linkType === 'image' ? buildMediaFilePath(linkAddress) : linkAddress"
    target="_blank"
  >
    <image-resolver
      class="image-preview"
      v-if="linkType === 'image'"
      :src="linkAddress"
    />

    <template v-else>
      <component :is="wrapperComponent" :id="orgLinkId">
        <content-renderer v-if="linkNameNode" :node="linkNameNode" />
        <template v-else>
          {{ linkAddress }}
        </template>
      </component>
    </template>
  </a>
</template>

<script setup lang="ts">
import { defineComponent, toRef } from 'vue';

import { OrgNode } from 'org-mode-ast';

import {
  buildMediaFilePath,
  extractOrgLink,
  extractOrgLinkId,
} from 'src/tools';

import ContentRenderer from './ContentRenderer.vue';
import ImageResolver from './containers/ImageResolver.vue';
import NotePreview from './containers/NotePreview.vue';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const rawLink = node.value.children.get(1).children.get(1).value;
const linkAddress = extractOrgLink(rawLink);

const linkNameNode =
  node.value.children.length === 4 ? node.value.children.get(2) : null;

const linkType = node.value.meta?.linkType;

const orgLinkId = extractOrgLinkId(rawLink);
const wrapperComponent = linkType === 'id' ? NotePreview : 'span';
</script>

<style lang="scss" scoped>
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
