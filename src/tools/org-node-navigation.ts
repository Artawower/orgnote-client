import { OrgNode, walkTree } from 'org-mode-ast';

export const findOrgNode = (
  orgNode: OrgNode,
  foundFn: (orgNode: OrgNode) => boolean
): OrgNode => {
  let foundNode: OrgNode;
  walkTree(orgNode, (n: OrgNode) => {
    const found = foundFn(n);
    if (found) {
      foundNode = n;
      return true;
    }
  });

  return foundNode;
};
