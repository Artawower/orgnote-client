import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { NodeType, parse, walkTree, withMetaInfo, type OrgNode } from 'org-mode-ast';
import type { MultilineEmbeddedWidget } from 'orgnote-api';
import { addMultilineWidgetEffect, orgMultilineWidgetField } from './org-multiline-widget-state';

const createRootNode = (doc: string): OrgNode => withMetaInfo(parse(doc));

const findFirstNode = (root: OrgNode, type: NodeType): OrgNode => {
  let found: OrgNode | undefined;
  walkTree(root, (node) => {
    if (node.is(type)) {
      found = node;
      return true;
    }
    return false;
  });
  if (!found) {
    throw new Error(`Missing org node: ${type}`);
  }
  return found;
};

const createWidget = (): MultilineEmbeddedWidget => ({
  id: 'test-widget',
  widgetBuilder: () => ({
    destroy: () => {},
  }),
});

const getDecorationRanges = (state: EditorState): Array<{ from: number; to: number }> => {
  const ranges: Array<{ from: number; to: number }> = [];
  state
    .field(orgMultilineWidgetField)
    .between(0, state.doc.length, (from, to) => {
      ranges.push({ from, to });
    });
  return ranges;
};

describe('orgMultilineWidgetField', () => {
  it('maps widget ranges when content changes before widget', () => {
    const doc = `Title
| a | b |
| c | d |
`;
    const rootNode = createRootNode(doc);
    const tableNode = findFirstNode(rootNode, NodeType.Table);
    const state = EditorState.create({
      doc,
      extensions: [orgMultilineWidgetField],
    });
    const view = new EditorView({ state, parent: document.createElement('div') });

    view.dispatch({
      effects: addMultilineWidgetEffect.of({
        orgNode: tableNode,
        view,
        rootNodeSrc: () => rootNode,
        multilineWidget: createWidget(),
      }),
    });

    const initialRanges = getDecorationRanges(view.state);
    expect(initialRanges).toHaveLength(1);
    const initialRange = initialRanges[0]!;

    const insertText = 'X';
    view.dispatch({
      changes: { from: 0, insert: insertText },
    });

    const updatedRanges = getDecorationRanges(view.state);
    expect(updatedRanges).toHaveLength(1);
    const updatedRange = updatedRanges[0]!;
    expect(updatedRange.from).toBe(initialRange.from + insertText.length);
    expect(updatedRange.to).toBe(initialRange.to + insertText.length);

    view.destroy();
  });
});
import { describe, expect, it } from 'vitest';
