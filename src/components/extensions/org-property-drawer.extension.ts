import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
} from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgPropertyDrawer from './OrgPropertyDrawer.vue';

export const propertyDrawerExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.PropertyDrawer,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgPropertyDrawer),
      ignoreEvent: true,
      suppressEdit: true,
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const propertyDrawerExtensionManifest: ExtensionManifest = {
  name: 'Property drawer',
  description: 'Pretty property drawer multiline widget for editor',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
