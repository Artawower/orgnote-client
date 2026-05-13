import type { HeadlineContext } from './headline-context';
import { findExistingLogbook } from './find-logbook';
import type { TextEdit } from './text-edits';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildStateChangePattern = (toKeyword: string, date: string): RegExp =>
  new RegExp(
    `^- State "${escapeRegExp(toKeyword)}" from "[^"]+" \\[${escapeRegExp(date)}[^\\]]*\\](?:\\n|$)`,
    'm',
  );

const removeMatchedLine = (content: string, match: RegExpExecArray): string =>
  content.slice(0, match.index) + content.slice(match.index + match[0].length);

export const buildRemoveLogStateChangeEdit = (
  ctx: HeadlineContext,
  toKeyword: string,
  date: string,
): TextEdit | undefined => {
  const section = ctx.headline.section;
  if (!section) return undefined;
  const logbook = findExistingLogbook(section, ctx.content);
  if (!logbook) return undefined;
  const body = ctx.content.slice(logbook.contentStart, logbook.contentEnd);
  const match = buildStateChangePattern(toKeyword, date).exec(body);
  if (!match) return undefined;
  if (!removeMatchedLine(body, match).trim()) {
    return { start: logbook.start, end: logbook.end, replacement: '' };
  }
  const start = logbook.contentStart + match.index;
  return { start, end: start + match[0].length, replacement: '' };
};
