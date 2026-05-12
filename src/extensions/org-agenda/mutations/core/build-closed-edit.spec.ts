import { test, expect } from 'vitest';
import { buildClosedEdit } from './build-closed-edit';
import { parseHeadlineContext } from './headline-context';
import { applyTextEdits } from './text-edits';

const COMPLETED_AT = new Date(2024, 0, 15, 10, 30); // 2024-01-15 Mon 10:30 local

const applyClosedEdit = (content: string, completedAt: Date | null): string => {
  const ctx = parseHeadlineContext(content, 0);
  if (!ctx) throw new Error('No headline context');
  const edit = buildClosedEdit(ctx, completedAt);
  return edit ? applyTextEdits(content, [edit]) : content;
};

test('buildClosedEdit_addClosed_noPlanningLine', () => {
  const content = '* TODO Task\nBody text\n';
  const result = applyClosedEdit(content, COMPLETED_AT);
  expect(result).toContain('CLOSED:');
  expect(result).toContain('[2024-01-15');
});

test('buildClosedEdit_addClosed_existingScheduled', () => {
  const content = '* TODO Task\nSCHEDULED: <2024-01-10 Wed>\nBody\n';
  const result = applyClosedEdit(content, COMPLETED_AT);
  expect(result).toMatch(/CLOSED:.*SCHEDULED:/);
});

test('buildClosedEdit_removeClosed_leavesCleanPlanningLine', () => {
  const content = '* DONE Task\nCLOSED: [2024-01-15 Mon 10:30] SCHEDULED: <2024-01-10 Wed>\n';
  const result = applyClosedEdit(content, null);
  expect(result).not.toContain('CLOSED:');
  expect(result).toContain('SCHEDULED:');
  expect(result).not.toMatch(/^\s+SCHEDULED:/m);
});

test('buildClosedEdit_removeClosed_noClosed_returnsUntouched', () => {
  const content = '* TODO Task\nSCHEDULED: <2024-01-10 Wed>\n';
  const result = applyClosedEdit(content, null);
  expect(result).toBe(content);
});

test('buildClosedEdit_updateExistingClosed_replacesTimestamp', () => {
  const content = '* DONE Task\nCLOSED: [2023-12-01 Fri 09:00]\n';
  const result = applyClosedEdit(content, COMPLETED_AT);
  expect(result).toContain('[2024-01-15');
  expect(result).not.toContain('[2023-12-01');
});

test('buildClosedEdit_nullCompletedAt_noPlanningLine_noChange', () => {
  const content = '* TODO Task\nBody\n';
  const ctx = parseHeadlineContext(content, 0)!;
  expect(buildClosedEdit(ctx, null)).toBeUndefined();
});
