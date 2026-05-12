import { expect, test } from 'vitest';
import { openClock, closeClock } from './clock';

const startedAt = new Date('2026-05-12T10:00:00');
const endedAt = new Date('2026-05-12T10:45:00');

test('openClock_createsLogbook_whenSectionHasNone', () => {
  const result = openClock('* TODO Task\n', 0, startedAt);
  expect(result).toContain(':LOGBOOK:');
  expect(result).toContain('CLOCK: [2026-05-12');
  expect(result).toContain(':END:');
});

test('openClock_insertsClockIntoExistingLogbook', () => {
  const result = openClock('* TODO Task\n:LOGBOOK:\n:END:\n', 0, startedAt);
  expect(result).toContain('CLOCK: [2026-05-12');
  expect(result!.indexOf(':LOGBOOK:')).toBeLessThan(result!.indexOf('CLOCK:'));
});

test('openClock_returnsUndefined_whenHeadlineNotFound', () => {
  expect(openClock('* TODO Task\n', 99, startedAt)).toBeUndefined();
});

test('closeClock_closesMatchingClock_withDuration', () => {
  const opened = openClock('* TODO Task\n', 0, startedAt)!;
  const result = closeClock(opened, 0, startedAt, endedAt);
  expect(result).toContain('--[2026-05-12');
  expect(result).toContain('0:45');
  expect(result).not.toMatch(/CLOCK: \[\d{4}[^\]]+\]\n/);
});

test('closeClock_closesOnlyMatchingClock_notOthers', () => {
  let content = '* TODO Task\n:LOGBOOK:\nCLOCK: [2026-05-11 Mon 09:00]\n:END:\n';
  content = openClock(content, 0, startedAt)!;
  const result = closeClock(content, 0, startedAt, endedAt);
  expect(result).toContain('CLOCK: [2026-05-11 Mon 09:00]\n');
  expect(result).toContain('--');
});

test('closeClock_returnsUndefined_whenOpenClockNotFound', () => {
  expect(closeClock('* TODO Task\n', 0, startedAt, endedAt)).toBeUndefined();
});
