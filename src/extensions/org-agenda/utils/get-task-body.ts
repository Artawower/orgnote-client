import { NodeType, parse, withMetaInfo, walkTree } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';

const END_DRAWER_TEXT = ':END:';

const findBodyStart = (section: OrgNode, content: string): number => {
  const children = section.childrenList ?? [];
  let bodyStart = section.start;
  let inDrawer = false;

  children.every((child: OrgNode) => {
    if (child.is(NodeType.Planning) || child.is(NodeType.NewLine)) {
      bodyStart = child.end;
      return true;
    }
    if (child.is(NodeType.PropertyDrawer)) {
      bodyStart = child.end;
      inDrawer = false;
      return true;
    }
    if (child.is(NodeType.Property)) {
      const text = content.slice(child.start, child.end).trim().toUpperCase();
      inDrawer = text !== END_DRAWER_TEXT;
      bodyStart = child.end;
      return true;
    }
    if (inDrawer) {
      bodyStart = child.end;
      return true;
    }
    return false;
  });

  return bodyStart;
};

const findHeadlineSection = (ast: OrgNode, headlineStart: number): OrgNode | null => {
  let found: OrgNode | null = null;
  let insideTarget = false;

  walkTree(ast, (node: OrgNode): boolean => {
    if (node.is(NodeType.Headline)) {
      insideTarget = node.start === headlineStart;
      return !insideTarget;
    }
    if (insideTarget && node.is(NodeType.Section)) found = node;
    return false;
  });

  return found;
};

export const getTaskBody = (content: string, headlineStart: number): string => {
  const ast = withMetaInfo(parse(content));
  const section = findHeadlineSection(ast, headlineStart);
  if (!section) return '';

  const bodyStart = findBodyStart(section, content);
  return content.slice(bodyStart, section.end).trim();
};
