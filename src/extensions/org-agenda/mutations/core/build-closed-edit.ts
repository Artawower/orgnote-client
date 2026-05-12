import { NodeType, findNextSibling } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import type { HeadlineContext } from './headline-context';
import type { TextEdit } from './text-edits';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number): string => String(n).padStart(2, '0');

const formatClosedTimestamp = (d: Date): string =>
  `[${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${DAY_NAMES[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}]`;

const buildClosedText = (completedAt: Date): string =>
  `CLOSED: ${formatClosedTimestamp(completedAt)}`;

const findPlanningNode = (headline: OrgNode): OrgNode | undefined =>
  headline.section?.childrenList.find((n) => n.is(NodeType.Planning));

const findClosedKeyword = (planning: OrgNode): OrgNode | undefined =>
  planning.childrenList.find((n) => n.is(NodeType.PlanningKeyword) && n.value === 'CLOSED:');

const findClosedDate = (keyword: OrgNode): OrgNode | undefined =>
  findNextSibling(keyword, (n) => n.is(NodeType.Date, NodeType.DateRange)) ?? undefined;

const withTrailingSpace = (end: number, content: string): number =>
  content[end] === ' ' ? end + 1 : end;

const editForExistingClosed = (
  keyword: OrgNode,
  completedAt: Date | null,
  content: string,
): TextEdit => {
  const dateNode = findClosedDate(keyword);
  const baseEnd = dateNode?.end ?? keyword.end;
  if (!completedAt)
    return { start: keyword.start, end: withTrailingSpace(baseEnd, content), replacement: '' };
  return { start: keyword.start, end: baseEnd, replacement: buildClosedText(completedAt) };
};

const editForMissingClosed = (planning: OrgNode, completedAt: Date): TextEdit => ({
  start: planning.start,
  end: planning.start,
  replacement: `${buildClosedText(completedAt)} `,
});

const editForNoPlanningLine = (headline: OrgNode, completedAt: Date): TextEdit | undefined => {
  const sectionStart = headline.section?.start;
  if (sectionStart === undefined) return undefined;
  return {
    start: sectionStart,
    end: sectionStart,
    replacement: `${buildClosedText(completedAt)}\n`,
  };
};

export const buildClosedEdit = (
  ctx: HeadlineContext,
  completedAt: Date | null,
): TextEdit | undefined => {
  const planning = findPlanningNode(ctx.headline);

  if (!planning) {
    if (!completedAt) return undefined;
    return editForNoPlanningLine(ctx.headline, completedAt);
  }

  const closedKeyword = findClosedKeyword(planning);
  if (closedKeyword) return editForExistingClosed(closedKeyword, completedAt, ctx.content);
  if (!completedAt) return undefined;
  return editForMissingClosed(planning, completedAt);
};
