import { parse, withMetaInfo, NodeType } from 'org-mode-ast';
import type { OrgNode, Heading } from 'org-mode-ast';

export interface HeadlineContext {
  content: string;
  root: OrgNode;
  headline: OrgNode;
  heading?: Heading;
}

const findHeadlineAt = (root: OrgNode, headlineStart: number): OrgNode | undefined => {
  if (root.is(NodeType.Headline) && root.start === headlineStart) return root;
  return root.childrenList
    .flatMap((child) => [child, ...(child.section?.childrenList ?? [])])
    .map((child) => findHeadlineAt(child, headlineStart))
    .find(Boolean);
};

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
    heading: root.meta?.headings?.find((h) => h.start === headlineStart),
  };
};
