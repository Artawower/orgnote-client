import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgPropertyDrawer from './OrgPropertyDrawer.vue';

export const orgPropertyDrawerExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();

    addWidgets({
      type: WidgetType.Multiline,
      nodeType: NodeType.PropertyDrawer,
      component: OrgPropertyDrawer,
      ignoreEvent: true,
      suppressEdit: true,
    });
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(NodeType.PropertyDrawer);
  },
};

export { orgPropertyDrawerManifest } from './manifest';
