<template>
  <image-resolver
    class="image-preview"
    v-if="linkType === 'image'"
    :src="linkAddress"
  />
  <a v-else :href="linkAddress" class="org-link" target="_blank">
    <component :is="wrapperComponent" :id="orgLinkId">
      <content-renderer v-if="linkNameNode" :node="linkNameNode" />
      <template v-else>
        {{ linkAddress }}
      </template>
    </component>
  </a>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { extractOrgLink, extractOrgLinkId } from 'src/tools';

import { defineComponent, toRef } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import ImageResolver from './containers/ImageResolver.vue';
import NotePreviewLink from './containers/NotePreviewLink.vue';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  node: OrgNode;
}>();

defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const node = toRef(props, 'node');

const rawLink = node.value.children.get(1).children.get(1).value;
const linkAddress = extractOrgLink(rawLink);

const linkNameNode =
  node.value.children.length === 4 ? node.value.children.get(2) : null;

const linkType = node.value.meta?.linkType;

const orgLinkId = extractOrgLinkId(rawLink);
const wrapperComponent = linkType === 'id' ? NotePreviewLink : 'span';
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
  height: auto;
  max-width: 100% !important;
}

.org-link {
  color: var(--fg);
}
</style>
