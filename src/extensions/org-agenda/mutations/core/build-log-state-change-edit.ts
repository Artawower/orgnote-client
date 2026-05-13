import type { HeadlineContext } from './headline-context';
import { findLogbookInsertPoint, wrapLogbookEntry } from './find-logbook';
import type { TextEdit } from './text-edits';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number): string => String(n).padStart(2, '0');

const formatTimestamp = (date: Date): string =>
  `[${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${DAY_NAMES[date.getDay()]} ${pad(date.getHours())}:${pad(date.getMinutes())}]`;

const buildLogLine = (fromKeyword: string, toKeyword: string, timestamp: Date): string =>
  `- State "${toKeyword}" from "${fromKeyword}" ${formatTimestamp(timestamp)}`;

export const buildLogStateChangeEdit = (
  ctx: HeadlineContext,
  fromKeyword: string,
  toKeyword: string,
  timestamp: Date,
): TextEdit | undefined => {
  const section = ctx.headline.section;
  if (!section) return undefined;
  const point = findLogbookInsertPoint(section, ctx.content);
  const entry = `${buildLogLine(fromKeyword, toKeyword, timestamp)}\n`;
  const replacement = point.shouldCreateDrawer ? wrapLogbookEntry(entry) : entry;
  return { start: point.insertAt, end: point.insertAt, replacement };
};
