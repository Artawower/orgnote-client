import { NodeType, parse, withMetaInfo, walkTree } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import { format, parseISO } from 'date-fns';

const SCHEDULED_KEYWORD = 'SCHEDULED:';

const buildScheduledLine = (date: string): string =>
  `SCHEDULED: <${date} ${format(parseISO(date), 'EEE')}>\n`;

const buildScheduledFragment = (date: string): string =>
  `SCHEDULED: <${date} ${format(parseISO(date), 'EEE')}>`;

type ScheduledInfo = {
  planningStart: number;
  keywordStart: number;
  dateEnd: number;
  hasOtherKeywords: boolean;
} | null;

const isScheduledKeyword = (node: OrgNode): boolean =>
  node.is(NodeType.PlanningKeyword) && node.value === SCHEDULED_KEYWORD;

const extractScheduledFromPlanning = (
  planningNode: OrgNode,
): { keywordStart: number; dateEnd: number; hasOtherKeywords: boolean } | null => {
  const children = planningNode.childrenList ?? [];
  const scheduledIdx = children.findIndex(isScheduledKeyword);
  if (scheduledIdx === -1) return null;

  const scheduledNode = children[scheduledIdx];
  if (!scheduledNode) return null;

  const dateAfter = children.slice(scheduledIdx + 1).find((c) => c.is(NodeType.Date));
  if (!dateAfter) return null;

  const hasOtherKeywords = children.some(
    (c, i) => i !== scheduledIdx && c.is(NodeType.PlanningKeyword),
  );

  return {
    keywordStart: scheduledNode.start,
    dateEnd: dateAfter.end,
    hasOtherKeywords,
  };
};

const findScheduledInfo = (content: string, headlineStart: number): ScheduledInfo => {
  const ast = withMetaInfo(parse(content));
  let result: ScheduledInfo = null;
  let inTarget = false;

  walkTree(ast, (node: OrgNode): boolean => {
    if (node.is(NodeType.Headline)) {
      if (node.start === headlineStart) {
        inTarget = true;
        return false;
      }
      if (inTarget) return true;
      return false;
    }
    if (!(inTarget && node.is(NodeType.Planning))) return false;

    const found = extractScheduledFromPlanning(node);
    if (found) result = { planningStart: node.start, ...found };
    return false;
  });

  return result;
};

const sectionStart = (content: string, headlineStart: number): number => {
  const newline = content.indexOf('\n', headlineStart);
  return newline === -1 ? content.length : newline + 1;
};

const replaceFullLine = (content: string, lineStart: number, replacement: string): string => {
  const lineEnd = content.indexOf('\n', lineStart);
  const afterLine = lineEnd === -1 ? content.length : lineEnd + 1;
  return content.slice(0, lineStart) + replacement + content.slice(afterLine);
};

const removeFromMixedPlanning = (
  content: string,
  keywordStart: number,
  dateEnd: number,
): string => {
  if (content[keywordStart - 1] === ' ') {
    return content.slice(0, keywordStart - 1) + content.slice(dateEnd);
  }
  if (content[dateEnd] === ' ') {
    return content.slice(0, keywordStart) + content.slice(dateEnd + 1);
  }
  return content.slice(0, keywordStart) + content.slice(dateEnd);
};

const replaceInMixedPlanning = (
  content: string,
  keywordStart: number,
  dateEnd: number,
  date: string | undefined,
): string => {
  if (!date) return removeFromMixedPlanning(content, keywordStart, dateEnd);
  return content.slice(0, keywordStart) + buildScheduledFragment(date) + content.slice(dateEnd);
};

const insertScheduled = (content: string, headlineStart: number, date: string): string => {
  const pos = sectionStart(content, headlineStart);
  return content.slice(0, pos) + buildScheduledLine(date) + content.slice(pos);
};

export const changeTaskScheduled = (
  content: string,
  headlineStart: number,
  date: string | undefined,
): string => {
  const info = findScheduledInfo(content, headlineStart);

  if (!info && !date) return content;
  if (!info && date) return insertScheduled(content, headlineStart, date);
  if (!info) return content;

  if (info.hasOtherKeywords) {
    return replaceInMixedPlanning(content, info.keywordStart, info.dateEnd, date);
  }

  return replaceFullLine(content, info.planningStart, date ? buildScheduledLine(date) : '');
};
