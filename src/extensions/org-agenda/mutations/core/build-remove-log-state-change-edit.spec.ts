import { expect, test } from 'vitest';
import { parseHeadlineContext } from './headline-context';
import { buildRemoveLogStateChangeEdit } from './build-remove-log-state-change-edit';
import { applyTextEdits } from './text-edits';

const applyRemoveEdit = (content: string, date = '2026-05-13'): string | undefined => {
  const ctx = parseHeadlineContext(content, 0);
  if (!ctx) return undefined;
  const edit = buildRemoveLogStateChangeEdit(ctx, 'DONE', date);
  if (!edit) return undefined;
  return applyTextEdits(content, [edit]);
};

test('buildRemoveLogStateChangeEdit_removesEntryFromMultipleEntries', () => {
  const content =
    '* TODO Daily\n:LOGBOOK:\n- State "DONE" from "TODO" [2026-05-13 Wed 14:30]\n- State "TODO" from "DONE" [2026-05-12 Tue 09:00]\n:END:\nBody\n';

  const result = applyRemoveEdit(content);

  expect(result).not.toContain('2026-05-13');
  expect(result).toContain('2026-05-12');
  expect(result).toContain(':LOGBOOK:');
});

test('buildRemoveLogStateChangeEdit_removesLastMatchingEntryOnly', () => {
  const content =
    '* TODO Daily\n:LOGBOOK:\n- State "TODO" from "DONE" [2026-05-13 Wed 15:00]\n- State "DONE" from "TODO" [2026-05-13 Wed 14:30]\n:END:\nBody\n';

  const result = applyRemoveEdit(content);

  expect(result).toContain('State "TODO"');
  expect(result).not.toContain('State "DONE"');
  expect(result).toContain(':LOGBOOK:');
});

test('buildRemoveLogStateChangeEdit_returnsUndefinedWhenEntryMissing', () => {
  const content =
    '* TODO Daily\n:LOGBOOK:\n- State "DONE" from "TODO" [2026-05-12 Tue 14:30]\n:END:\nBody\n';
  const ctx = parseHeadlineContext(content, 0);

  expect(ctx && buildRemoveLogStateChangeEdit(ctx, 'DONE', '2026-05-13')).toBeUndefined();
});

test('buildRemoveLogStateChangeEdit_removesEmptyDrawerWithLastEntry', () => {
  const content =
    '* TODO Daily\n:LOGBOOK:\n- State "DONE" from "TODO" [2026-05-13 Wed 14:30]\n:END:\nBody\n';

  const result = applyRemoveEdit(content);

  expect(result).toBe('* TODO Daily\nBody\n');
});
