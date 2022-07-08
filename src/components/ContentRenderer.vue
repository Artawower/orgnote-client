<template>
  <template v-if="content?.type === 'text'">
    <component :is="typedComponents['text']" :content="content"></component>
  </template>
  <template v-else-if="content?.type === 'link'">
    <component :is="typedComponents['link']" :content="content"></component>
  </template>
  <template v-else>
    <!-- TODO: master  revise types -->
    <template v-for="c of children" :key="c.position">
      <component :is="typedComponents[c.type]" :content="c"> </component>
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
import { computed, defineComponent, toRefs } from 'vue';
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
import { useViewStore } from 'src/stores/view';

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
}>();

if (props.isPrivate) {
  typedComponents['property-drawer'] = OrgPropertyDrawer;
  typedComponents['keyword'] = OrgKeyword;
}

defineComponent(typedComponents);

const { content } = toRefs(props);

const viewStore = useViewStore();

// TODO: master remove any casting. Proof of concept approach.
(content.value as unknown as { children: OrgNode[] })?.children?.forEach(
  (c) => {
    viewStore.registerNestedNode(c);
    if (c?.type === 'headline') {
      viewStore.registerHeadline(c);
    }
  }
);

const children = computed(() =>
  (content.value as any)?.children?.filter((v) => viewStore.isNodeVisible(v))
);
</script>
