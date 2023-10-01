import { EditorState, Transaction } from '@codemirror/state';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

export function readOnlyTransactionFilter(getOrgNode: () => OrgNode) {
  return EditorState.transactionFilter.of((tr) => {
    if (tr.docChanged && !tr.annotation(Transaction.remote)) {
      let block = false;
      const blockedRange: [number?, number?] = [];
      const orgNode = getOrgNode();
      walkTree(orgNode, (n) => {
        if (n.is(NodeType.PropertyDrawer) && n.parent?.is(NodeType.Root)) {
          blockedRange[0] = n.start;
          blockedRange[1] = n.end + 1;
          return true;
        }
      });
      tr.changes.iterChangedRanges((chFrom, chTo) => {
        if (
          chFrom >= blockedRange[0] &&
          chTo <= blockedRange[1] &&
          chFrom !== chTo
        ) {
          block = true;
        }
      });
      if (block) return [];
    }
    return tr;
  });
}
