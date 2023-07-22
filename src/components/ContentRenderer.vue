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
import { defineComponent, toRef } from 'vue';
import type { Component } from 'vue';

import OrgHeadline from './OrgHeadline.vue';
import OrgQuote from './OrgQuote.vue';
import OrgText from './OrgText.vue';
import OrgPlainList from './OrgPlainList.vue';
import OrgLink from './OrgLink.vue';
import OrgSrcBlock from './OrgSrcBlock.vue';
import OrgStrikeThrough from './OrgStrikeThrough.vue';
import OrgSrcBlockResult from './OrgSrcBlockResult.vue';
import OrgSrcInlineCode from './OrgSrcInlineCode.vue';
import OrgTable from './OrgTable.vue';
import OrgBold from './OrgBold.vue';
import OrgExportBlock from './OrgExportBlock.vue';
import OrgItalic from './OrgItalic.vue';
import NewLine from './OrgNewLine.vue';
import { NodeType, OrgNode } from 'org-mode-ast';

const typedComponents: { [key in NodeType]?: Component } = {
  [NodeType.Headline]: OrgHeadline,
  [NodeType.QuoteBlock]: OrgQuote,
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
  [NodeType.ExportBlock]: OrgExportBlock,
  [NodeType.LatexEnvironment]: OrgExportBlock,
  [NodeType.NewLine]: NewLine,
};

const props = defineProps<{
  node: Partial<OrgNode>;
  isPrivate?: boolean;
}>();

const node = toRef(props, 'node');
defineComponent(typedComponents);
</script>
