import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
  ast,
} from 'orgnote-api';
import OrgLink from './OrgLink.vue';
import { NodeType } from 'org-mode-ast';

export const imageExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.Link,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgLink),
      satisfied: (orgNode: ast.OrgNode) => {
        return orgNode.meta?.linkType == 'image';
      },
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const imageExtensionManifest: ExtensionManifest = {
  name: 'Image preview',
  description: 'Render image from org link.',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
