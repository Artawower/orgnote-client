import { OrgNode } from 'org-mode-ast';

export const nodeIds = Object.keys(OrgNode);

export const getOrgNodeId = (node: OrgNode): number => {
  return nodeIds.indexOf(node.type);
};
