import { parse, withMetaInfo, NodeType } from 'org-mode-ast';
import type { OrgNode, Heading } from 'org-mode-ast';

export interface HeadlineContext {
  content: string;
  root: OrgNode;
  headline: OrgNode;
  heading?: Heading;
}

const getSearchChildren = (node: OrgNode): OrgNode[] =>
  [node.title, node.section, ...node.childrenList].filter((child): child is OrgNode => !!child);

const containsOffset = (node: OrgNode, offset: number): boolean =>
  node.start <= offset && offset < node.end;

const findHeadlineAt = (root: OrgNode, headlineStart: number): OrgNode | undefined => {
  const nested = getSearchChildren(root)
    .map((child) => findHeadlineAt(child, headlineStart))
    .find(Boolean);
  if (nested) return nested;
  if (root.is(NodeType.Headline) && containsOffset(root, headlineStart)) return root;
  return undefined;
};

const findHeading = (
  root: OrgNode,
  headline: OrgNode,
  headlineStart: number,
): Heading | undefined =>
  root.meta?.headings?.find((h) => h.start === headline.start || h.start === headlineStart);

export const parseHeadlineContext = (
  content: string,
  headlineStart: number,
): HeadlineContext | undefined => {
  const root = withMetaInfo(parse(content));
  const headline = findHeadlineAt(root, headlineStart);
  if (!headline) return undefined;
  return {
    content,
    root,
    headline,
    heading: findHeading(root, headline, headlineStart),
  };
};
