import { expect, test } from 'vitest';
import { parseHeadlineContext } from './headline-context';
import { buildLogStateChangeEdit } from './build-log-state-change-edit';
import { applyTextEdits } from './text-edits';

const timestamp = new Date(2026, 4, 13, 12, 34);
const logLine = '- State "DONE" from "TODO" [2026-05-13 Wed 12:34]';

const applyLogEdit = (content: string): string | undefined => {
  const ctx = parseHeadlineContext(content, 0);
  if (!ctx) return undefined;
  const edit = buildLogStateChangeEdit(ctx, 'TODO', 'DONE', timestamp);
  if (!edit) return undefined;
  return applyTextEdits(content, [edit]);
};

test('buildLogStateChangeEdit_insertsIntoExistingEmptyLogbook', () => {
  const content = '* TODO Task\n:LOGBOOK:\n:END:\n';

  expect(applyLogEdit(content)).toBe(`* TODO Task\n:LOGBOOK:\n${logLine}\n:END:\n`);
});

test('buildLogStateChangeEdit_insertsAtTopOfExistingLogbook', () => {
  const content =
    '* TODO Task\n:LOGBOOK:\n- State "DONE" from "TODO" [2026-05-12 Tue 09:00]\n:END:\n';

  expect(applyLogEdit(content)).toBe(
    `* TODO Task\n:LOGBOOK:\n${logLine}\n- State "DONE" from "TODO" [2026-05-12 Tue 09:00]\n:END:\n`,
  );
});

test('buildLogStateChangeEdit_createsLogbookWhenMissing', () => {
  const content = '* TODO Task\nSCHEDULED: <2026-05-13 Wed>\nBody\n';

  expect(applyLogEdit(content)).toBe(
    `* TODO Task\nSCHEDULED: <2026-05-13 Wed>\n:LOGBOOK:\n${logLine}\n:END:\nBody\n`,
  );
});

test('buildLogStateChangeEdit_returnsUndefinedWithoutSection', () => {
  const ctx = parseHeadlineContext('* TODO Task', 0);

  expect(ctx && buildLogStateChangeEdit(ctx, 'TODO', 'DONE', timestamp)).toBeUndefined();
});
