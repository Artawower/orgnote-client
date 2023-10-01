import { insertNewlineAndIndent } from '@codemirror/commands';
import { StateCommand, TransactionSpec } from '@codemirror/state';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

export const orgAutoPairCommand = (getOrgNode: () => OrgNode): StateCommand => {
  return ({ state, dispatch }) => {
    const currentPos = state.selection.main.head;

    let currentOrgNode: OrgNode;

    walkTree(getOrgNode(), (n: OrgNode) => {
      if (n.end === currentPos) {
        currentOrgNode = n;
        return true;
      }
    });

    const transaction = getAutoInsertedSymbol(currentOrgNode);

    if (!transaction) {
      return insertNewlineAndIndent({ state, dispatch });
    }

    const tr = state.update(transaction);
    if (dispatch) dispatch(tr);
    return true;
  };
};

function getAutoInsertedSymbol(node: OrgNode): TransactionSpec {
  if (node.is(NodeType.Operator) && node.rawValue === '- ') {
    return {
      changes: { from: node.end - 2, to: node.end, insert: '' },
    };
  }
  if (node.parent?.parent?.is(NodeType.ListItem)) {
    return {
      changes: { from: node.end, insert: '\n- ' },
      selection: { anchor: node.end + 3 },
    };
  }
  if (
    node.is(NodeType.Keyword) &&
    node.rawValue.toLowerCase().startsWith('#+begin_')
  ) {
    const keyword = node.rawValue
      .toLowerCase()
      .split(' ')[0]
      .replace('#+begin_', '');
    return {
      changes: { from: node.end, insert: `\n\n#+end_${keyword}` },
      selection: { anchor: node.end + 1 },
    };
  }

  if (
    node.is(NodeType.BlockBody) &&
    node.parent?.is(NodeType.QuoteBlock) &&
    node.children?.last?.is(NodeType.NewLine)
  ) {
    return {
      changes: [
        { from: node.end - 1, to: node.end, insert: '' },
        { from: node.parent.end, insert: '\n' },
      ],
      selection: { anchor: node.parent.end },
    };
  }
}
