import { OrgNode } from 'org-mode-ast';

export function findParent(
  orgNode: OrgNode,
  found: (orgNode?: OrgNode) => boolean
): OrgNode {
  if (!orgNode) {
    return null;
  }
  if (found(orgNode)) {
    return orgNode;
  }

  return findParent(orgNode.parent, found);
}
