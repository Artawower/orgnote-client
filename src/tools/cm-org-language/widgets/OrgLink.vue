<template>
  <a :href="linkAddress" target="_blank">
    <component :is="wrapperComponent" :id="orgLinkId">
      {{ linkName ?? linkAddress }}
    </component>
  </a>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { extractOrgLink, extractOrgLinkId } from 'src/tools/extract-org-link';

import NotePreviewLink from 'src/components/containers/NotePreviewLink.vue';

const props = defineProps<{
  orgNode: OrgNode;
}>();

const rawLink = props.orgNode.children.get(1).children.get(1).value;
const linkAddress = extractOrgLink(rawLink);

const linkNameNode =
  props.orgNode.children.length === 4 ? props.orgNode.children.get(2) : null;

const linkName = linkNameNode?.children.get(1).value;

// NOTE: component is not reactive
// eslint-disable-next-line vue/no-setup-props-destructure
const linkType = props.orgNode.meta?.linkType;
const wrapperComponent = linkType === 'id' ? NotePreviewLink : 'span';
const orgLinkId = extractOrgLinkId(rawLink);
</script>

<style lang="scss"></style>
