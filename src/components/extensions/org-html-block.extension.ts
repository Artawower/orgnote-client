import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
} from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgHtmlBlock from './OrgHtmlBlock.vue';

export const htmlBlockExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.HtmlBlock,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgHtmlBlock),
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const htmlBlockExtensionManifest: ExtensionManifest = {
  name: 'HTML block',
  description: 'Preview HTML blocks',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
