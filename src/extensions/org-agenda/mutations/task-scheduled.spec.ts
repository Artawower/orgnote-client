import { expect, test } from 'vitest';
import { changeTaskScheduled } from './task-scheduled';

const HEADLINE = '* TODO My task';
const WITH_SCHEDULED = '* TODO My task\nSCHEDULED: <2026-05-17 Sun>\nbody';

test('changeTaskScheduled_addsScheduled_whenNotPresent', () => {
  const result = changeTaskScheduled(HEADLINE, 0, '2026-05-17');
  expect(result).toContain('SCHEDULED: <2026-05-17 Sun>');
});

test('changeTaskScheduled_replacesScheduled_whenAlreadyPresent', () => {
  const result = changeTaskScheduled(WITH_SCHEDULED, 0, '2026-06-01');
  expect(result).toContain('SCHEDULED: <2026-06-01 Mon>');
  expect(result).not.toContain('2026-05-17');
});

test('changeTaskScheduled_removesScheduled_whenDateUndefined', () => {
  const result = changeTaskScheduled(WITH_SCHEDULED, 0, undefined);
  expect(result).not.toContain('SCHEDULED:');
  expect(result).toContain('body');
});

test('changeTaskScheduled_preservesDeadline_whenChangingScheduled', () => {
  const content = '* TODO My task\nSCHEDULED: <2026-05-17 Sun>\nDEADLINE: <2026-05-20 Wed>\nbody';
  const result = changeTaskScheduled(content, 0, '2026-06-01');
  expect(result).toContain('DEADLINE: <2026-05-20 Wed>');
  expect(result).toContain('SCHEDULED: <2026-06-01 Mon>');
});

test('changeTaskScheduled_noChange_whenNoScheduledAndUndefined', () => {
  expect(changeTaskScheduled(HEADLINE, 0, undefined)).toBe(HEADLINE);
});

test('changeTaskScheduled_preservesBody_whenAddingScheduled', () => {
  const content = '* TODO My task\nbody content';
  const result = changeTaskScheduled(content, 0, '2026-05-17');
  expect(result).toContain('body content');
  expect(result).toContain('SCHEDULED:');
});

test('changeTaskScheduled_onlyModifiesTargetHeadline_withOffset', () => {
  const content = '* TODO First\nSCHEDULED: <2026-05-10 Sun>\n* TODO Second\nbody';
  const secondStart = content.indexOf('* TODO Second');
  const result = changeTaskScheduled(content, secondStart, '2026-06-01');
  expect(result).toContain('SCHEDULED: <2026-05-10 Sun>');
  expect(result).toContain('SCHEDULED: <2026-06-01 Mon>');
});

test('changeTaskScheduled_preservesDeadline_whenRemovingScheduled', () => {
  const result = changeTaskScheduled(
    '* TODO My task\nSCHEDULED: <2026-05-17 Sun>\nDEADLINE: <2026-05-20 Wed>\n',
    0,
    undefined,
  );
  expect(result).not.toContain('SCHEDULED:');
  expect(result).toContain('DEADLINE:');
});

test('removesScheduled_fromMixedLine_whenScheduledFirst', () => {
  const content = '* TODO Task\nSCHEDULED: <2026-05-17 Sun> CLOSED: [2026-05-21 Thu]';
  const result = changeTaskScheduled(content, 0, undefined);
  expect(result).toContain('CLOSED: [2026-05-21 Thu]');
  expect(result).not.toContain(' CLOSED');
  expect(result).not.toContain('SCHEDULED:');
});

test('removesScheduled_fromMixedLine_whenScheduledLast', () => {
  const content = '* TODO Task\nCLOSED: [2026-05-21 Thu] SCHEDULED: <2026-05-17 Sun>';
  const result = changeTaskScheduled(content, 0, undefined);
  expect(result).toContain('CLOSED: [2026-05-21 Thu]');
  expect(result).not.toContain('CLOSED: [2026-05-21 Thu] ');
  expect(result).not.toContain('SCHEDULED:');
});

test('replacesScheduled_inMixedLine_whenScheduledFirst', () => {
  const content = '* TODO Task\nSCHEDULED: <2026-05-17 Sun> CLOSED: [2026-05-21 Thu]';
  const result = changeTaskScheduled(content, 0, '2026-06-01');
  expect(result).toContain('SCHEDULED: <2026-06-01 Mon> CLOSED: [2026-05-21 Thu]');
  expect(result).not.toContain('2026-05-17');
});
