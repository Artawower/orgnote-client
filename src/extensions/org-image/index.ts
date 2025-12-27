import type { Extension } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import type { OrgNode } from 'org-mode-ast';
import { NodeType } from 'org-mode-ast';
import OrgImage from './OrgImage.vue';

export const orgImageExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();

    addWidgets({
      type: WidgetType.Multiline,
      nodeType: NodeType.Link,
      component: OrgImage,
      satisfied: (orgNode: OrgNode) => orgNode.meta?.linkType === 'image',
    });
  },

  onUnmounted: async () => {
    // NOTE: Cannot safely remove widget for NodeType.Link as it would break
    // other link widgets (e.g. inline links). Widget registry needs refactoring
    // to support multiple widgets per NodeType with different satisfied conditions.
  },
};

export { orgImageManifest } from './manifest';
