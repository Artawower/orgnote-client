import { expect, test } from 'vitest';
import { isOverdue, isToday, isTomorrow, isNextSevenDays, hasNoDate } from './agenda-filters';
import type { FileMeta } from 'orgnote-api';

type FileTask = NonNullable<FileMeta['tasks']>[number];

const now = new Date('2026-05-12T12:00:00');

const withScheduled = (date: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  scheduled: { date, active: true, hasTime: false, start: 0, end: 0 },
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

const noDateTask: FileTask = { id: '1', kind: 'headline-todo', state: 'todo', text: 'Task' };

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

test('isToday_returnsTrue_forToday', () => {
  expect(isToday(withScheduled('2026-05-12'), now)).toBe(true);
});

test('isToday_returnsFalse_forYesterday', () => {
  expect(isToday(withScheduled('2026-05-11'), now)).toBe(false);
});

test('isToday_usesScheduledFirst_whenBothPresent', () => {
  expect(isToday(withBoth('2026-05-12', '2026-05-15'), now)).toBe(true);
});

test('isToday_fallsBackToDeadline_whenNoScheduled', () => {
  expect(isToday(withDeadline('2026-05-12'), now)).toBe(true);
});

test('isTomorrow_returnsTrue_forTomorrow', () => {
  expect(isTomorrow(withScheduled('2026-05-13'), now)).toBe(true);
});

test('isTomorrow_returnsFalse_forToday', () => {
  expect(isTomorrow(withScheduled('2026-05-12'), now)).toBe(false);
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

test('isNextSevenDays_returnsFalse_forOverdueTask', () => {
  expect(isNextSevenDays(withScheduled('2026-05-11'), now)).toBe(false);
});

test('isToday_recurringDaily_fromOldBase_returnsTrue', () => {
  const task = {
    scheduled: { date: '2020-01-01', repeater: { type: '+', value: 1, unit: 'd' } },
  };
  expect(isToday(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(true);
});

test('isTomorrow_recurringDaily_returnsTrue', () => {
  const task = {
    scheduled: { date: '2020-01-01', repeater: { type: '+', value: 1, unit: 'd' } },
  };
  expect(isTomorrow(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(true);
});

test('isNextSevenDays_recurringWeekly_pastBase_returnsTrue', () => {
  const task = {
    scheduled: { date: '2026-05-06', repeater: { type: '+', value: 1, unit: 'w' } },
  };
  expect(isNextSevenDays(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(true);
});

test('isOverdue_recurringTask_returnsFalse', () => {
  const task = {
    scheduled: { date: '2020-01-01', repeater: { type: '+', value: 1, unit: 'd' } },
  };
  expect(isOverdue(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(false);
});

test('isOverdue_nonRecurringPast_returnsTrue', () => {
  const task = { scheduled: { date: '2026-05-01' } };
  expect(isOverdue(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(true);
});

test('isToday_recurringMonthly_returnsTrue', () => {
  const task = {
    scheduled: { date: '2026-01-13', repeater: { type: '+', value: 1, unit: 'm' } },
  };
  expect(isToday(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(true);
});

test('hasOccurrenceInRange_zeroValueRepeater_doesNotInfiniteLoop', () => {
  const task = {
    scheduled: { date: '2020-01-01', repeater: { type: '+', value: 0, unit: 'd' } },
  };
  expect(isToday(task as unknown as FileTask, new Date('2026-05-13T12:00:00Z'))).toBe(false);
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
