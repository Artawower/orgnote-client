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

const findTodoKeywordNode = (headline: OrgNode): OrgNode | undefined =>
  headline.title?.childrenList.find((n) => n.is(NodeType.TodoKeyword));

export const changeTaskStatus = (
  content: string,
  headlineStart: number,
  newKeyword: string,
): string | undefined => {
  const root = withMetaInfo(parse(content));
  const headline = findHeadlineAt(root, headlineStart);
  if (!headline) return undefined;
  const keywordNode = findTodoKeywordNode(headline);
  if (!keywordNode) return undefined;
  return replaceRange(content, keywordNode.start, keywordNode.end, newKeyword);
};
