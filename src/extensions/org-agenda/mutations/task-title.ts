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

const titlePrefixTypes = new Set([NodeType.Operator, NodeType.TodoKeyword, NodeType.Priority]);
const titleSuffixTypes = new Set([NodeType.TagList, NodeType.NewLine]);

const resolveTitleTextRange = (headline: OrgNode): { start: number; end: number } | undefined => {
  const children = headline.title?.childrenList ?? [];
  const lastPrefix = [...children].reverse().find((n) => titlePrefixTypes.has(n.type as NodeType));
  const firstSuffix = children.find((n) => titleSuffixTypes.has(n.type as NodeType));
  const rangeStart = lastPrefix ? lastPrefix.end : headline.title?.start;
  const rangeEnd = firstSuffix ? firstSuffix.start : headline.title?.end;
  if (rangeStart === undefined || rangeEnd === undefined) return undefined;
  return { start: rangeStart, end: rangeEnd };
};

export const changeTaskTitle = (
  content: string,
  headlineStart: number,
  newTitle: string,
): string | undefined => {
  const root = withMetaInfo(parse(content));
  const headline = findHeadlineAt(root, headlineStart);
  if (!headline) return undefined;
  const range = resolveTitleTextRange(headline);
  if (!range) return undefined;
  return replaceRange(content, range.start, range.end, ` ${newTitle} `);
};
