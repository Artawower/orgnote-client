import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgPropertyDrawer from './OrgPropertyDrawer.vue';

const WIDGET_ID = 'org-property-drawer';

export const orgPropertyDrawerExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();

    addWidgets({
      id: WIDGET_ID,
      type: WidgetType.Multiline,
      nodeType: NodeType.PropertyDrawer,
      component: OrgPropertyDrawer,
      ignoreEvent: true,
      suppressEdit: true,
      priority: 0,
    });
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(WIDGET_ID);
  },
};

export { orgPropertyDrawerManifest } from './manifest';
