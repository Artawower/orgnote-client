<template>
  <template v-if="node?.value">
    <component v-if="node" :is="typedComponents[node.type]" :node="node">
    </component>
  </template>
  <template v-else>
    <template v-for="n of node?.children" :key="n.position">
      <component :is="typedComponents[n.type]" :node="n"> </component>
    </template>
  </template>
</template>

<script setup lang="ts">
import { NodeType, OrgNode } from 'org-mode-ast';

import { defineComponent, toRef } from 'vue';
import type { Component } from 'vue';

import OrgBold from './OrgBold.vue';
import OrgEntity from './OrgEntity.vue';
import OrgHeadline from './OrgHeadline.vue';
import OrgItalic from './OrgItalic.vue';
import OrgLatexBlock from './extensions/OrgLatexBlock.vue';
import OrgLink from 'src/components/extensions/OrgLink.vue';
import NewLine from './OrgNewLine.vue';
import OrgPlainList from './OrgPlainList.vue';
import OrgQuoteBlock from 'src/components/extensions/OrgQuoteBlock.vue';
import RawLink from 'src/components/extensions/OrgRawLink.vue';
import OrgSrcBlock from 'src/components/extensions/OrgSrcBlock.vue';
import OrgSrcBlockResult from './OrgSrcBlockResult.vue';
import OrgSrcInlineCode from './OrgSrcInlineCode.vue';
import OrgStrikeThrough from './OrgStrikeThrough.vue';
import OrgTable from 'src/components/extensions/OrgTable.vue';
import OrgText from './OrgText.vue';

const typedComponents: { [key in NodeType]?: Component } = {
  [NodeType.Headline]: OrgHeadline,
  [NodeType.QuoteBlock]: OrgQuoteBlock,
  [NodeType.Italic]: OrgItalic,
  [NodeType.Text]: OrgText,
  [NodeType.List]: OrgPlainList,
  [NodeType.Link]: OrgLink,
  [NodeType.SrcBlock]: OrgSrcBlock,
  [NodeType.Crossed]: OrgStrikeThrough,
  [NodeType.FixedWidth]: OrgSrcBlockResult,
  [NodeType.Verbatim]: OrgSrcInlineCode,
  [NodeType.InlineCode]: OrgSrcInlineCode,
  [NodeType.Table]: OrgTable,
  [NodeType.Bold]: OrgBold,
  [NodeType.ExportBlock]: OrgLatexBlock,
  [NodeType.LatexEnvironment]: OrgLatexBlock,
  [NodeType.NewLine]: NewLine,
  [NodeType.RawLink]: RawLink,
  [NodeType.Entity]: OrgEntity,
};

const props = defineProps<{
  node: Partial<OrgNode>;
  isPrivate?: boolean;
}>();

const node = toRef(props, 'node');
defineComponent(typedComponents);
</script>
