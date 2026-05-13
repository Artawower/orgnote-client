import { parse, withMetaInfo, NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import { findLogbookInsertPoint, wrapLogbookEntry } from './core/find-logbook';

const replaceRange = (content: string, start: number, end: number, replacement: string): string =>
  content.slice(0, start) + replacement + content.slice(end);

const findHeadlineAt = (root: OrgNode, headlineStart: number): OrgNode | undefined => {
  if (root.is(NodeType.Headline) && root.start === headlineStart) return root;
  return root.childrenList
    .flatMap((child) => [child, ...(child.section?.childrenList ?? [])])
    .map((child) => findHeadlineAt(child, headlineStart))
    .find(Boolean);
};

const formatOrgTimestamp = (date: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    `[${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${days[date.getDay()]} ${pad(date.getHours())}:${pad(date.getMinutes())}]`
  );
};

const formatDuration = (startedAt: Date, endedAt: Date): string => {
  const totalMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const buildOpenClockSearchTerm = (startedAt: Date): string =>
  `CLOCK: ${formatOrgTimestamp(startedAt)}\n`;

export const openClock = (
  content: string,
  headlineStart: number,
  startedAt: Date,
): string | undefined => {
  const root = withMetaInfo(parse(content));
  const headline = findHeadlineAt(root, headlineStart);
  if (!headline?.section) return undefined;
  const point = findLogbookInsertPoint(headline.section, content);
  const clockLine = buildOpenClockSearchTerm(startedAt);
  const insertion = point.shouldCreateDrawer ? wrapLogbookEntry(clockLine) : clockLine;
  return content.slice(0, point.insertAt) + insertion + content.slice(point.insertAt);
};

export const closeClock = (
  content: string,
  headlineStart: number,
  startedAt: Date,
  endedAt: Date,
): string | undefined => {
  const root = withMetaInfo(parse(content));
  const headline = findHeadlineAt(root, headlineStart);
  if (!headline?.section) return undefined;
  const openClockLine = buildOpenClockSearchTerm(startedAt);
  const matchStart = content.indexOf(openClockLine, headline.section.start);
  if (matchStart === -1 || matchStart >= headline.section.end) return undefined;
  const duration = formatDuration(startedAt, endedAt);
  const closedLine = `CLOCK: ${formatOrgTimestamp(startedAt)}--${formatOrgTimestamp(endedAt)} =>  ${duration}\n`;
  return replaceRange(content, matchStart, matchStart + openClockLine.length, closedLine);
};
