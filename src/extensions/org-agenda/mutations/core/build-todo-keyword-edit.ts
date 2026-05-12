import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import type { HeadlineContext } from './headline-context';
import type { TextEdit } from './text-edits';

const findTodoKeywordNode = (headline: OrgNode): OrgNode | undefined =>
  headline.title?.childrenList.find((n) => n.is(NodeType.TodoKeyword));

export const buildTodoKeywordEdit = (
  ctx: HeadlineContext,
  keyword: string,
): TextEdit | undefined => {
  const node = findTodoKeywordNode(ctx.headline);
  if (!node) return undefined;
  return { start: node.start, end: node.end, replacement: keyword };
};
