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
      }
      return false;
    });

    const transaction = getAutoInsertedSymbol(currentOrgNode);

    if (transaction) {
      const tr = state.update(transaction);
      if (dispatch) dispatch(tr);
      return true;
    }

    return insertNewlineAndIndent({ state, dispatch });
  };
};

const orgOperatorRegexp = /(\- |\+ |\d+[\)\.]{1})/;
// TODO: master A very likely candidate to be refactored
function getAutoInsertedSymbol(node: OrgNode): TransactionSpec {
  if (!node) {
    return;
  }
  if (node.is(NodeType.Operator) && node.rawValue.match(orgOperatorRegexp)) {
    return {
      changes: { from: node.start, to: node.end, insert: '' },
    };
  }
  if (
    node.isNot(NodeType.NewLine) &&
    node.parent?.parent?.is(NodeType.ListItem)
  ) {
    const operator = node.parent.children.first.rawValue.trim();

    const isNumberList = operator.match(/\d+[\)\.]{1}/);
    const newOperator = isNumberList
      ? +operator.slice(0, -1) + 1 + operator.slice(-1)
      : operator;

    return {
      changes: { from: node.end, insert: `\n${newOperator} ` },
      selection: { anchor: node.end + newOperator.length + 2 },
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
