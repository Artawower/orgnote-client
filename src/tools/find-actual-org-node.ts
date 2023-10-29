import { findOrgNode } from './org-node-navigation';
import { OrgNode } from 'org-mode-ast';

export function findActualOrgNode(node: OrgNode, rootNode: OrgNode): OrgNode {
  const actualNode = findOrgNode(
    rootNode,
    (n) => n.start === node.start && n.end === node.end && n.is(node.type)
  );
  return actualNode;
}
