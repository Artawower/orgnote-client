import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgHtmlBlock from './OrgHtmlBlock.vue';

export const orgHtmlBlockExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();

    addWidgets({
      type: WidgetType.Multiline,
      nodeType: NodeType.HtmlBlock,
      component: OrgHtmlBlock,
    });
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(NodeType.HtmlBlock);
  },
};

export { orgHtmlBlockManifest } from './manifest';
