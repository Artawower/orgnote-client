import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
} from 'orgnote-api';
import OrgTable from './OrgTable.vue';
import { NodeType } from 'org-mode-ast';

export const tableExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.Table,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgTable),
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const tableExtensionManifest: ExtensionManifest = {
  name: 'Simple table',
  description: 'Render default latex blocks',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
