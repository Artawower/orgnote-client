import { EditorState, Transaction } from '@codemirror/state';
import { NodeType, walkTree } from 'org-mode-ast';
import { orgNodeGetterFacet } from '../facets';

export const readOnlyTransactionFilter = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged || !tr.annotation(Transaction.userEvent)) {
    return tr;
  }

  const getOrgNode = tr.state.facet(orgNodeGetterFacet);
  const orgNode = getOrgNode();
  if (!orgNode) return tr;

  let block = false;
  const blockedRange: [number?, number?] = [];

  walkTree(orgNode, (n): boolean => {
    if (n.is(NodeType.PropertyDrawer) && n.parent?.is(NodeType.Root)) {
      blockedRange[0] = n.start;
      blockedRange[1] = n.end + 1;
      return true;
    }
    return false;
  });

  tr.changes.iterChangedRanges((chFrom, chTo) => {
    if (
      blockedRange[0] !== undefined &&
      blockedRange[1] !== undefined &&
      chFrom >= blockedRange[0] &&
      chTo <= blockedRange[1] &&
      chFrom !== chTo
    ) {
      block = true;
    }
  });

  return block ? [] : tr;
});
