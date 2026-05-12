import { NodeType, findNextSibling } from 'org-mode-ast';
import type { OrgDate, OrgNode } from 'org-mode-ast';
import { nextDateFromRepeater } from '../../utils/repeater';
import type { HeadlineContext } from './headline-context';
import type { TextEdit } from './text-edits';

const UTC_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatRepeaterPart = (repeater: OrgDate['repeater']): string =>
  repeater ? ` ${repeater.type}${repeater.value}${repeater.unit}` : '';

const formatOrgDate = (isoDate: string, original: OrgDate): string => {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  const brackets: [string, string] = original.active ? ['<', '>'] : ['[', ']'];
  return `${brackets[0]}${isoDate.slice(0, 10)} ${UTC_DAY_NAMES[d.getUTCDay()]}${formatRepeaterPart(original.repeater)}${brackets[1]}`;
};

const findPlanningNode = (headline: OrgNode): OrgNode | undefined =>
  headline.section?.childrenList.find((n) => n.is(NodeType.Planning));

const findPlanningKeyword = (
  planning: OrgNode,
  keyword: 'SCHEDULED:' | 'DEADLINE:',
): OrgNode | undefined =>
  planning.childrenList.find((n) => n.is(NodeType.PlanningKeyword) && n.value === keyword);

const findDateNode = (keywordNode: OrgNode): OrgNode | undefined =>
  findNextSibling(keywordNode, (n) => n.is(NodeType.Date, NodeType.DateRange)) ?? undefined;

const buildDateEdit = (
  planning: OrgNode,
  keyword: 'SCHEDULED:' | 'DEADLINE:',
  original: OrgDate | undefined,
  completedAt: Date,
): TextEdit | undefined => {
  if (!original?.repeater) return undefined;
  const keywordNode = findPlanningKeyword(planning, keyword);
  if (!keywordNode) return undefined;
  const dateNode = findDateNode(keywordNode);
  if (!dateNode) return undefined;
  const nextDate = nextDateFromRepeater(original, completedAt);
  return {
    start: dateNode.start,
    end: dateNode.end,
    replacement: formatOrgDate(nextDate, original),
  };
};

export const buildAdvanceRepeaterEdits = (ctx: HeadlineContext, completedAt: Date): TextEdit[] => {
  const planning = findPlanningNode(ctx.headline);
  if (!planning) return [];
  return [
    buildDateEdit(planning, 'SCHEDULED:', ctx.heading?.scheduled, completedAt),
    buildDateEdit(planning, 'DEADLINE:', ctx.heading?.deadline, completedAt),
  ].filter((e): e is TextEdit => !!e);
};
