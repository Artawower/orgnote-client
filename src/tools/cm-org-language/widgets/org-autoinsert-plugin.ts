import { insertNewlineAndIndent } from '@codemirror/commands';
import { StateCommand, TransactionSpec } from '@codemirror/state';
import nodeTest from 'node:test';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

// TODO: master refactor.
export const orgAutoCompleteCommand = (
  getOrgNode: () => OrgNode
): StateCommand => {
  return (params) => {
    const { state, dispatch } = params;
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
    node.parent?.parent?.is(NodeType.ListItem) &&
    node.parent?.isNot(NodeType.Section)
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
    node.is(NodeType.NewLine) &&
    node.parent?.is(NodeType.BlockBody) &&
    node.parent?.parent?.is(NodeType.QuoteBlock)
  ) {
    return {
      changes: [
        { from: node.end - 1, to: node.end, insert: '' },
        { from: node.parent.parent.end, insert: '\n' },
      ],
      selection: { anchor: node.parent.parent.end },
    };
  }

  if (node.is(NodeType.Text) && node.parent?.parent?.is(NodeType.ListItem)) {
    return {
      changes: { from: node.end, to: node.end, insert: '\n ' },
      selection: { anchor: node.end + 2 },
    };
  }

  if (node.is(NodeType.Indent)) {
    return {
      changes: { from: node.start, to: node.end, insert: '' },
      selection: { anchor: node.start },
    };
  }
}
