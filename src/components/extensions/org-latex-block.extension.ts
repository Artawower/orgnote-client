import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
} from 'orgnote-api';
import OrgLatexBlock from './OrgLatexBlock.vue';
import { NodeType } from 'org-mode-ast';

export const latexBlockExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.ExportBlock,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgLatexBlock),
    });

    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.LatexEnvironment,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgLatexBlock),
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const latexBlockExtensionManifest: ExtensionManifest = {
  name: 'Latex blocks',
  description: 'Render default latex blocks',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
