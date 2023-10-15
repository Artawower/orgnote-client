import { autoInsertRules } from './auto-insert-rules';
import { insertNewlineAndIndent } from '@codemirror/commands';
import { StateCommand, TransactionSpec } from '@codemirror/state';
import { OrgNode, walkTree } from 'org-mode-ast';

export const orgAutoInsertCommand = (
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

function getAutoInsertedSymbol(node: OrgNode): TransactionSpec {
  if (!node) {
    return;
  }

  let transaction: TransactionSpec;
  autoInsertRules.find((r) => {
    transaction = r(node);
    return !!transaction;
  });
  return transaction;
}
