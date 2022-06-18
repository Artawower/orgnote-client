<template>
  <template v-if="content?.type === 'text'">
    <component :is="typedComponents['text']" :content="content"></component>
  </template>
  <template v-else>
    <component
      v-for="c of content?.children"
      :key="c.position"
      :is="typedComponents[c.type]"
      :content="c"
    ></component>
  </template>
</template>

<script setup lang="ts">
import type {
  ElementType,
  GreaterElementType,
  Link,
  ObjectType,
  OrgData,
  OrgNode,
} from 'uniorg';
import { defineComponent, toRefs } from 'vue';
import type { Component } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import OrgHeadline from './OrgHeadline.vue';
import OrgQuote from './OrgQuote.vue';
import OrgParagraph from './OrgParagraph.vue';
import OrgText from './OrgText.vue';
import OrgPlainList from './OrgPlainList.vue';
import OrgLink from './OrgLink.vue';
import OrgSrcBlock from './OrgSrcBlock.vue';
import OrgStrikeThrough from './OrgStrikeThrough.vue';
import OrgSrcBlockResult from './OrgSrcBlockResult.vue';

const typedComponents: { [key in OrgNode['type']]?: Component } = {
  section: ContentRenderer,
  headline: OrgHeadline,
  'quote-block': OrgQuote,
  paragraph: OrgParagraph,
  text: OrgText,
  'plain-list': OrgPlainList,
  link: OrgLink,
  'src-block': OrgSrcBlock,
  'strike-through': OrgStrikeThrough,
  'fixed-width': OrgSrcBlockResult,
};

defineComponent(typedComponents);

const props = defineProps<{
  content: OrgData | GreaterElementType | ElementType | Link | ObjectType;
}>();

const { content } = toRefs(props);
</script>
