import { parse, withMetaInfo, NodeType, findNextSibling } from 'org-mode-ast';
import type { OrgNode, OrgDate } from 'org-mode-ast';
import { nextDateFromRepeater } from '../utils/repeater';

const utcDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const findScheduledDateNode = (headline: OrgNode): OrgNode | undefined => {
  const planning = headline.section?.childrenList.find((n) => n.is(NodeType.Planning));
  if (!planning) return undefined;
  const scheduledKeyword = planning.childrenList.find(
    (n) => n.is(NodeType.PlanningKeyword) && n.value === 'SCHEDULED:',
  );
  if (!scheduledKeyword) return undefined;
  return (
    findNextSibling(scheduledKeyword, (n) => n.is(NodeType.Date, NodeType.DateRange)) ?? undefined
  );
};

const formatRepeaterPart = (repeater: OrgDate['repeater']): string =>
  repeater ? ` ${repeater.type}${repeater.value}${repeater.unit}` : '';

const formatOrgDate = (isoDate: string, original: OrgDate): string => {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  const dayName = utcDayNames[d.getUTCDay()];
  const brackets: [string, string] = original.active ? ['<', '>'] : ['[', ']'];
  return `${brackets[0]}${isoDate.slice(0, 10)} ${dayName}${formatRepeaterPart(original.repeater)}${brackets[1]}`;
};

const formatClockEntry = (completedAt: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const ts = (d: Date): string =>
    `[${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${utcDayNames[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}]`;
  return `CLOCK: ${ts(completedAt)}--${ts(completedAt)} =>  0:00\n`;
};

const insertClockIntoLogbook = (content: string, section: OrgNode, completedAt: Date): string => {
  const clockLine = formatClockEntry(completedAt);
  const logbookIdx = content.indexOf(':LOGBOOK:', section.start);
  if (logbookIdx !== -1 && logbookIdx < section.end) {
    const insertAt = logbookIdx + ':LOGBOOK:'.length + 1;
    return content.slice(0, insertAt) + clockLine + content.slice(insertAt);
  }
  const logbook = `:LOGBOOK:\n${clockLine}:END:\n`;
  return content.slice(0, section.start) + logbook + content.slice(section.start);
};

const applyStatusReset = (content: string, headline: OrgNode): string => {
  const keywordNode = findTodoKeywordNode(headline);
  if (!keywordNode) return content;
  return replaceRange(content, keywordNode.start, keywordNode.end, 'TODO');
};

const applyScheduledUpdate = (
  content: string,
  headline: OrgNode,
  scheduled: OrgDate,
  completedAt: Date,
): string => {
  const dateNode = findScheduledDateNode(headline);
  if (!dateNode) return content;
  const nextDate = nextDateFromRepeater(scheduled, completedAt);
  return replaceRange(content, dateNode.start, dateNode.end, formatOrgDate(nextDate, scheduled));
};

const parseHeadline = (content: string, headlineStart: number) => {
  const root = withMetaInfo(parse(content));
  return {
    headline: findHeadlineAt(root, headlineStart),
    scheduled: root.meta?.headings?.find((h) => h.start === headlineStart)?.scheduled,
  };
};

export const completeHabit = (
  content: string,
  headlineStart: number,
  completedAt: Date,
): string | undefined => {
  const initial = parseHeadline(content, headlineStart);
  if (!initial.headline || !initial.scheduled?.repeater) return undefined;

  const afterReset = applyStatusReset(content, initial.headline);

  const afterResetParsed = parseHeadline(afterReset, headlineStart);
  if (!afterResetParsed.headline || !afterResetParsed.scheduled) return undefined;
  const afterSchedule = applyScheduledUpdate(
    afterReset,
    afterResetParsed.headline,
    afterResetParsed.scheduled,
    completedAt,
  );

  const { headline: finalHeadline } = parseHeadline(afterSchedule, headlineStart);
  if (!finalHeadline?.section) return afterSchedule;
  return insertClockIntoLogbook(afterSchedule, finalHeadline.section, completedAt);
};
