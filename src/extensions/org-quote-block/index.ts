import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgQuoteBlock from './OrgQuoteBlock.vue';

export const orgQuoteBlockExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();

    addWidgets({
      type: WidgetType.Multiline,
      nodeType: NodeType.QuoteBlock,
      component: OrgQuoteBlock,
    });
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(NodeType.QuoteBlock);
  },
};

export { orgQuoteBlockManifest } from './manifest';
