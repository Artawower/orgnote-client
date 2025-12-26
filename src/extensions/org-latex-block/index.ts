import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgLatexBlock from './OrgLatexBlock.vue';

export const orgLatexBlockExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();

    addWidgets(
      {
        type: WidgetType.Multiline,
        nodeType: NodeType.ExportBlock,
        component: OrgLatexBlock,
      },
      {
        type: WidgetType.Multiline,
        nodeType: NodeType.LatexEnvironment,
        component: OrgLatexBlock,
      },
    );
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(NodeType.ExportBlock);
    removeWidget(NodeType.LatexEnvironment);
  },
};

export { orgLatexBlockManifest } from './manifest';
