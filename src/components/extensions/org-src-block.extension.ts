import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  ViewUpdateSchema,
  WidgetType,
  ast,
} from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import OrgSrcBlock from './OrgSrcBlock.vue';

const viewUpdater = (
  srcOrgNode: ast.OrgNode,
  newText: string
): ViewUpdateSchema => {
  let node = srcOrgNode?.next;
  let startNode: ast.OrgNode;
  let endNode: ast.OrgNode;

  while (node) {
    if (startNode && node.is(NodeType.FixedWidth)) {
      endNode = node;
      node = node.next;
      continue;
    }
    if (
      node.is(NodeType.Keyword) &&
      node.rawValue.toLowerCase() === '#+results:'
    ) {
      startNode = node;
      node = node.next;
      continue;
    }
    if (node.isNot(NodeType.NewLine)) {
      break;
    }
    node = node.next;
  }

  const start = startNode?.start ?? srcOrgNode.parent.end;
  const end = endNode?.end ?? startNode?.end ?? start;

  return {
    from: start,
    to: end,
    insert: `${startNode ? '' : '\n'}#+RESULTS:\n: ${newText}`,
  };
};
export const srcBlockExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add({
      type: WidgetType.Multiline,
      nodeType: NodeType.SrcBlock,
      widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgSrcBlock),
      viewUpdater,
    });
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const srcBlockExtensionManifest: ExtensionManifest = {
  name: 'Src block',
  description: 'Multiline widget for displaying SRC blocks with highlight',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
