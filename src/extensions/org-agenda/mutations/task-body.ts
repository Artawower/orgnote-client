import { parse, withMetaInfo, NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';

const replaceRange = (content: string, start: number, end: number, replacement: string): string =>
  content.slice(0, start) + replacement + content.slice(end);

const findHeadlineAt = (root: OrgNode, headlineStart: number): OrgNode | undefined => {
  if (root.is(NodeType.Headline) && root.start === headlineStart) return root;
  return root.childrenList
    .flatMap((child) => [child, ...(child.section?.childrenList ?? [])])
    .map((child) => findHeadlineAt(child, headlineStart))
    .find(Boolean);
};

const drawerTypes = new Set([NodeType.PropertyDrawer, NodeType.Planning]);

const resolveBodyRange = (headline: OrgNode): { start: number; end: number } | undefined => {
  const section = headline.section;
  if (!section) return undefined;
  const firstDrawer = section.childrenList.find((n) => drawerTypes.has(n.type as NodeType));
  const bodyEnd = firstDrawer ? firstDrawer.start : section.end;
  return { start: section.start, end: bodyEnd };
};

export const changeTaskBody = (
  content: string,
  headlineStart: number,
  newBody: string,
): string | undefined => {
  const root = withMetaInfo(parse(content));
  const headline = findHeadlineAt(root, headlineStart);
  if (!headline) return undefined;
  const range = resolveBodyRange(headline);
  if (!range) return undefined;
  const bodyText = newBody.trim() ? `${newBody.trim()}\n` : '';
  return replaceRange(content, range.start, range.end, bodyText);
};
