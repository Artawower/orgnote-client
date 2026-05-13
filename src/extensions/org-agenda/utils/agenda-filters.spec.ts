import { expect, test } from 'vitest';
import type { FileMeta } from 'orgnote-api';
import type { OrgRepeater } from 'org-mode-ast';
import { isOverdue, isToday, isTomorrow, isNextSevenDays, hasNoDate } from './agenda-filters';

type FileTask = NonNullable<FileMeta['tasks']>[number];

const now = new Date('2026-05-12T12:00:00Z');

const withScheduled = (date: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  scheduled: { date, active: true, hasTime: false, start: 0, end: 0 },
});

const withScheduledRepeater = (date: string, repeater: OrgRepeater): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  scheduled: { date, active: true, hasTime: false, start: 0, end: 0, repeater },
});

const withDeadline = (date: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  deadline: { date, active: true, hasTime: false, start: 0, end: 0 },
});

const withBoth = (scheduledDate: string, deadlineDate: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  scheduled: { date: scheduledDate, active: true, hasTime: false, start: 0, end: 0 },
  deadline: { date: deadlineDate, active: true, hasTime: false, start: 0, end: 0 },
});

const dailyRepeater = { type: '+', value: 1, unit: 'd' } as const;
const everyTwoDaysRepeater = { type: '+', value: 2, unit: 'd' } as const;
const monthlyRepeater = { type: '+', value: 1, unit: 'm' } as const;
const zeroDayRepeater = { type: '+', value: 0, unit: 'd' } as const;

const noDateTask: FileTask = { id: '1', kind: 'headline-todo', state: 'todo', text: 'Task' };

const utcNoon = (date: string): Date => new Date(`${date}T12:00:00Z`);

test('isOverdue_returnsTrue_forPastScheduledDate', () => {
  expect(isOverdue(withScheduled('2026-05-11'), now)).toBe(true);
});

test('isOverdue_returnsFalse_forToday', () => {
  expect(isOverdue(withScheduled('2026-05-12'), now)).toBe(false);
});

test('isOverdue_returnsFalse_forFutureDate', () => {
  expect(isOverdue(withScheduled('2026-05-13'), now)).toBe(false);
});

test('isOverdue_returnsFalse_forTaskWithoutDate', () => {
  expect(isOverdue(noDateTask, now)).toBe(false);
});

test('isOverdue_usesDeadline_whenNoScheduled', () => {
  expect(isOverdue(withDeadline('2026-05-10'), now)).toBe(true);
});

test('isOverdue_usesDeadlineFirst_evenWhenScheduledIsFuture', () => {
  expect(isOverdue(withBoth('2026-05-13', '2026-05-11'), now)).toBe(true);
});

test('isOverdue_recurringWithPastBase_returnsTrue', () => {
  expect(isOverdue(withScheduledRepeater('2020-01-01', dailyRepeater), utcNoon('2026-05-13'))).toBe(
    true,
  );
});

test('isToday_returnsTrue_forToday', () => {
  expect(isToday(withScheduled('2026-05-12'), now)).toBe(true);
});

test('isToday_returnsTrue_forYesterdayNonRecurring_dueToOverdueRule', () => {
  expect(isToday(withScheduled('2026-05-11'), now)).toBe(true);
});

test('isToday_usesScheduledFirst_whenBothPresent', () => {
  expect(isToday(withBoth('2026-05-12', '2026-05-15'), now)).toBe(true);
});

test('isToday_fallsBackToDeadline_whenNoScheduled', () => {
  expect(isToday(withDeadline('2026-05-12'), now)).toBe(true);
});

test('isToday_recurringDailyFromOldBase_returnsTrue', () => {
  expect(isToday(withScheduledRepeater('2020-01-01', dailyRepeater), utcNoon('2026-05-13'))).toBe(
    true,
  );
});

test('isToday_recurringEvery2Days_baseMonday_targetWednesday_returnsTrue', () => {
  expect(
    isToday(withScheduledRepeater('2026-05-11', everyTwoDaysRepeater), utcNoon('2026-05-13')),
  ).toBe(true);
});

test('isToday_recurringEvery2Days_targetTuesday_returnsTrue_dueToOverdueRule', () => {
  expect(
    isToday(withScheduledRepeater('2026-05-11', everyTwoDaysRepeater), utcNoon('2026-05-12')),
  ).toBe(true);
});

test('isToday_recurringMonthly_targetSameDayNextMonth_returnsTrue', () => {
  expect(isToday(withScheduledRepeater('2026-04-13', monthlyRepeater), utcNoon('2026-05-13'))).toBe(
    true,
  );
});

test('isTomorrow_returnsTrue_forTomorrow', () => {
  expect(isTomorrow(withScheduled('2026-05-13'), now)).toBe(true);
});

test('isTomorrow_returnsFalse_forToday', () => {
  expect(isTomorrow(withScheduled('2026-05-12'), now)).toBe(false);
});

test('isTomorrow_recurringDailyFromOldBase_returnsTrue', () => {
  expect(
    isTomorrow(withScheduledRepeater('2020-01-01', dailyRepeater), utcNoon('2026-05-13')),
  ).toBe(true);
});

test('isTomorrow_recurringEvery2Days_targetTuesday_returnsFalse', () => {
  expect(
    isTomorrow(withScheduledRepeater('2026-05-11', everyTwoDaysRepeater), utcNoon('2026-05-11')),
  ).toBe(false);
});

test('hasOccurrenceInRange_zeroValueRepeater_doesNotInfiniteLoop', () => {
  expect(
    isTomorrow(withScheduledRepeater('2020-01-01', zeroDayRepeater), utcNoon('2026-05-13')),
  ).toBe(false);
});

test('isNextSevenDays_returnsTrue_forToday', () => {
  expect(isNextSevenDays(withScheduled('2026-05-12'), now)).toBe(true);
});

test('isNextSevenDays_returnsTrue_forSevenDaysAhead', () => {
  expect(isNextSevenDays(withScheduled('2026-05-19'), now)).toBe(true);
});

test('isNextSevenDays_returnsFalse_forEightDaysAhead', () => {
  expect(isNextSevenDays(withScheduled('2026-05-20'), now)).toBe(false);
});

test('isNextSevenDays_returnsTrue_forOverdueTask', () => {
  expect(isNextSevenDays(withScheduled('2026-05-11'), now)).toBe(true);
});

test('hasNoDate_returnsTrue_whenNoDates', () => {
  expect(hasNoDate(noDateTask)).toBe(true);
});

test('hasNoDate_returnsFalse_whenHasScheduled', () => {
  expect(hasNoDate(withScheduled('2026-05-12'))).toBe(false);
});

test('hasNoDate_returnsFalse_whenHasDeadline', () => {
  expect(hasNoDate(withDeadline('2026-05-12'))).toBe(false);
});
