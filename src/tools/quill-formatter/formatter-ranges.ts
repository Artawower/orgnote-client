import { NodeType, OrgNode } from 'org-mode-ast';

const formatRange: {
  [key in NodeType]?: (arg0?: OrgNode) => [number, number];
} = {
  headline: (node: OrgNode) => [node.title.start, node.title.end],
};

export function getFormatRange(orgNode: OrgNode): [number, number] {
  const range = formatRange[orgNode.type]?.(orgNode);
  return range ?? [orgNode.start, orgNode.end];
}
