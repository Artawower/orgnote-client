import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';

import OrgTable from './OrgTable.vue';

export const orgTableExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();
    addWidgets({
      type: WidgetType.Multiline,
      nodeType: NodeType.Table,
      component: OrgTable,
    });
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(NodeType.Table);
  },
};

export { orgTableManifest } from './manifest';
