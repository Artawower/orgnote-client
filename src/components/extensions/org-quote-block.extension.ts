import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
} from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgQuoteBlock from './OrgQuoteBlock.vue';

export const quoteBlockExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.QuoteBlock,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgQuoteBlock),
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const quoteBlockExtensionManifest: ExtensionManifest = {
  name: 'Quote block',
  description: 'Pretty quote block multiline widget for editor',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
