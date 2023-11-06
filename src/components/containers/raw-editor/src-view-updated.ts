import { NodeType, OrgNode } from 'org-mode-ast';
import { ViewUpdateSchema } from 'src/tools/cm-org-language/widgets';

// orgNode is srcHeader node
export const srcHeaderViewUpdater = (
  srcOrgNode: OrgNode,
  newText: string
): ViewUpdateSchema => {
  let node = srcOrgNode?.parent?.next;
  let startNode: OrgNode;
  let endNode: OrgNode;

  while (node) {
    if (startNode && node.is(NodeType.FixedWidth)) {
      endNode = node;
      node = node.next;
      continue;
    }
    if (
      node.is(NodeType.Keyword) &&
      node.rawValue.toLowerCase() === '#+results:'
    ) {
      startNode = node;
      node = node.next;
      continue;
    }
    if (node.isNot(NodeType.NewLine)) {
      break;
    }
    node = node.next;
  }

  const start = startNode?.start ?? srcOrgNode.parent.end;
  const end = endNode?.end ?? startNode?.end ?? start;

  return {
    from: start,
    to: end,
    insert: `${startNode ? '' : '\n'}#+RESULTS:\n: ${newText}`,
  };
};

export const srcBlockViewUpdater = (
  srcOrgNode: OrgNode,
  newText: string
): ViewUpdateSchema => {
  let node = srcOrgNode?.next;
  let startNode: OrgNode;
  let endNode: OrgNode;

  while (node) {
    if (startNode && node.is(NodeType.FixedWidth)) {
      endNode = node;
      node = node.next;
      continue;
    }
    if (
      node.is(NodeType.Keyword) &&
      node.rawValue.toLowerCase() === '#+results:'
    ) {
      startNode = node;
      node = node.next;
      continue;
    }
    if (node.isNot(NodeType.NewLine)) {
      break;
    }
    node = node.next;
  }

  const start = startNode?.start ?? srcOrgNode.parent.end;
  const end = endNode?.end ?? startNode?.end ?? start;

  return {
    from: start,
    to: end,
    insert: `${startNode ? '' : '\n'}#+RESULTS:\n: ${newText}`,
  };
};
