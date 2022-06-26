<template>
  <template v-if="content?.type === 'text'">
    <component :is="typedComponents['text']" :content="content"></component>
  </template>
  <template v-else-if="content?.type === 'link'">
    <component :is="typedComponents['link']" :content="content"></component>
  </template>
  <template v-else>
    <!-- TODO: master  revise types -->
    <template v-for="c of content?.children" :key="c.position">
      <component
        v-if="isVisible(c)"
        :is="typedComponents[c.type]"
        :content="c"
        :headlineFolding="headlineFolding"
      >
      </component>
    </template>
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
import { defineComponent, toRef, toRefs } from 'vue';
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
import OrgSrcInlineCode from './OrgSrcInlineCode.vue';
import OrgTable from './OrgTable.vue';
import OrgPropertyDrawer from './OrgPropertyDrawer.vue';
import OrgKeyword from './OrgKeyword.vue';
import OrgBold from './OrgBold.vue';
import { HeadlineFolding } from 'src/stores/view';

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
  verbatim: OrgSrcInlineCode,
  table: OrgTable,
  bold: OrgBold,
};

const props = defineProps<{
  content: OrgData | GreaterElementType | ElementType | Link | ObjectType;
  isPrivate?: boolean;
  // TODO master (low priority): this enum should be placed inside content renderer.
  // Not in the state.
  headlineFolding: HeadlineFolding;
}>();

if (props.isPrivate) {
  typedComponents['property-drawer'] = OrgPropertyDrawer;
  typedComponents['keyword'] = OrgKeyword;
}

const headlineFolding = toRef(props, 'headlineFolding');

defineComponent(typedComponents);

const { content } = toRefs(props);

const alwaysOnDisplayTypes: OrgNode['type'][] = [
  'property-drawer',
  'section',
  'org-data',
  'keyword',
];

const isVisible = (c: OrgNode['data']) => {
  return (
    alwaysOnDisplayTypes.find((t) => t === c.type) ||
    headlineFolding.value == null ||
    headlineFolding.value === HeadlineFolding.ShowAll ||
    (c.type === 'headline' &&
      headlineFolding.value === HeadlineFolding.ShowHeadline) ||
    (c.type === 'headline' && c.level === 1)
  );
};
</script>
