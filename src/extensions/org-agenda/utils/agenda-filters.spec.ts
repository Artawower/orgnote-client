import { expect, test } from 'vitest';
import type { FileMeta } from 'orgnote-api';
import type { OrgRepeater } from 'org-mode-ast';
import {
  isOverdue,
  isToday,
  isTomorrow,
  isNextSevenDays,
  hasNoDate,
  isCompletedToday,
  isCompletedOn,
  getOccurrencesInRange,
  getFirstUnfinishedOccurrence,
  findNext7DaysViewDate,
} from './agenda-filters';

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

const withLastDoneAt = (lastDoneAt?: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  lastDoneAt,
});

const utcNoon = (date: string): Date => new Date(`${date}T12:00:00Z`);

// NEW: findNext7DaysViewDate — unified helper for Next 7 Days view
test('findNext7DaysViewDate_recurringNothingDone_returnsFirstOccurrence', () => {
  const task = withScheduledRepeater('2026-05-12', dailyRepeater);
  const result = findNext7DaysViewDate(task, now);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-12');
});

test('findNext7DaysViewDate_recurringTodayDone_returnsTomorrow', () => {
  const task: FileTask = {
    ...withScheduledRepeater('2026-05-13', dailyRepeater),
    doneDates: ['2026-05-12'],
  };
  // base 2026-05-13 (advanced after today's done), first unfinished = 2026-05-13
  const result = findNext7DaysViewDate(task, now);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-13');
});

test('findNext7DaysViewDate_recurringAllDone_returnsLastOccurrence', () => {
  const task: FileTask = {
    ...withScheduledRepeater('2026-05-12', dailyRepeater),
    doneDates: [
      '2026-05-12',
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
      '2026-05-18',
      '2026-05-19',
    ],
  };
  const result = findNext7DaysViewDate(task, now);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-19');
});

test('findNext7DaysViewDate_nonRecurringDoneInWindow_returnsBase', () => {
  const task: FileTask = {
    ...withScheduled('2026-05-15'),
    doneDates: ['2026-05-15'],
  };
  const result = findNext7DaysViewDate(task, now);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-15');
});

test('findNext7DaysViewDate_nonRecurringNotDoneInWindow_returnsBase', () => {
  const task = withScheduled('2026-05-15');
  const result = findNext7DaysViewDate(task, now);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-15');
});

test('findNext7DaysViewDate_nothingInWindow_returnsUndefined', () => {
  const task = withScheduled('2026-06-15');
  expect(findNext7DaysViewDate(task, now)).toBeUndefined();
});

// REGRESSION: filter visibility — completed in window stays visible
test('isNextSevenDays_nonRecurringCompletedInWindow_returnsTrue', () => {
  const task: FileTask = {
    ...withScheduled('2026-05-15'),
    doneDates: ['2026-05-15'],
  };
  expect(isNextSevenDays(task, now)).toBe(true);
});

test('isNextSevenDays_recurringAllCompletedInWindow_returnsTrue', () => {
  const task: FileTask = {
    ...withScheduledRepeater('2026-05-12', dailyRepeater),
    doneDates: [
      '2026-05-12',
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
      '2026-05-18',
      '2026-05-19',
    ],
  };
  expect(isNextSevenDays(task, now)).toBe(true);
});

// REGRESSION: Bug 4 — task completed-for-tomorrow should be visible in Tomorrow filter
test('isTomorrow_taskCompletedOnTomorrow_returnsTrue', () => {
  // User scenario: SCHEDULED advanced past tomorrow,
  // but LOGBOOK has DONE entry on tomorrow → should appear in Tomorrow with checked checkbox
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Test',
    scheduled: {
      date: '2026-05-14',
      active: true,
      hasTime: false,
      start: 0,
      end: 0,
      repeater: { type: '++', value: 1, unit: 'd' },
    },
    doneDates: ['2026-05-12', '2026-05-13'],
  };
  // today = 2026-05-12, tomorrow = 2026-05-13
  // doneDates includes 2026-05-13 → isTomorrow should be true
  expect(isTomorrow(task, now)).toBe(true);
});

test('isTomorrow_taskNotCompletedOnTomorrow_returnsFalse', () => {
  // Negative: doneDates only for today, not tomorrow → not in Tomorrow
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
    scheduled: {
      date: '2026-05-15',
      active: true,
      hasTime: false,
      start: 0,
      end: 0,
      repeater: { type: '+', value: 1, unit: 'd' },
    },
    doneDates: ['2026-05-12'],
  };
  expect(isTomorrow(task, now)).toBe(false);
});

// NEW: getOccurrencesInRange — collect all occurrence dates in window
test('getOccurrencesInRange_singleNonRecurringInWindow_returnsBase', () => {
  const task = withScheduled('2026-05-14');
  const range = getOccurrencesInRange(task, now, 0, 7);
  expect(range.map((d) => d.toISOString().slice(0, 10))).toEqual(['2026-05-14']);
});

test('getOccurrencesInRange_singleNonRecurringOutsideWindow_returnsEmpty', () => {
  const task = withScheduled('2026-06-01');
  const range = getOccurrencesInRange(task, now, 0, 7);
  expect(range).toEqual([]);
});

test('getOccurrencesInRange_recurringDailyFromToday_returns8Days', () => {
  // base today, +1d, window [0, 7] → 8 occurrences (inclusive)
  const task = withScheduledRepeater('2026-05-12', dailyRepeater);
  const range = getOccurrencesInRange(task, now, 0, 7);
  expect(range).toHaveLength(8);
  expect(range[0]?.toISOString().slice(0, 10)).toBe('2026-05-12');
  expect(range[7]?.toISOString().slice(0, 10)).toBe('2026-05-19');
});

test('getOccurrencesInRange_recurringEvery2Days_returnsAlternateDays', () => {
  // base today, +2d, window [0, 7] → occurrences on days 0, 2, 4, 6 (4 total)
  const task = withScheduledRepeater('2026-05-12', everyTwoDaysRepeater);
  const range = getOccurrencesInRange(task, now, 0, 7);
  expect(range.map((d) => d.toISOString().slice(0, 10))).toEqual([
    '2026-05-12',
    '2026-05-14',
    '2026-05-16',
    '2026-05-18',
  ]);
});

test('getOccurrencesInRange_zeroValueRepeater_returnsEmpty', () => {
  const task = withScheduledRepeater('2026-05-12', zeroDayRepeater);
  const range = getOccurrencesInRange(task, now, 0, 7);
  expect(range).toEqual([]);
});

test('getOccurrencesInRange_recurringMonthly_returnsMonthlyDates', () => {
  // base previous month, +1m, window large enough to catch one occurrence
  const task = withScheduledRepeater('2026-04-13', monthlyRepeater);
  const range = getOccurrencesInRange(task, now, 0, 30);
  // base 2026-04-13 < windowStart 2026-05-12, next is 2026-05-13 → in window
  expect(range.map((d) => d.toISOString().slice(0, 10))).toContain('2026-05-13');
});

// NEW: getFirstUnfinishedOccurrence — first occurrence not in doneDates
test('getFirstUnfinishedOccurrence_recurringNoDoneDates_returnsFirstOccurrence', () => {
  const task = withScheduledRepeater('2026-05-12', dailyRepeater);
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-12');
});

test('getFirstUnfinishedOccurrence_recurringTodayDone_returnsTomorrow', () => {
  // Real bug case: daily done today, viewing Next 7 Days → next pending = tomorrow
  const task: FileTask = {
    ...withScheduledRepeater('2026-05-12', dailyRepeater),
    doneDates: ['2026-05-12'],
  };
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-13');
});

test('getFirstUnfinishedOccurrence_recurringFirstThreeDone_returnsFourth', () => {
  const task: FileTask = {
    ...withScheduledRepeater('2026-05-12', dailyRepeater),
    doneDates: ['2026-05-12', '2026-05-13', '2026-05-14'],
  };
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-15');
});

test('getFirstUnfinishedOccurrence_recurringAllDone_returnsUndefined', () => {
  const task: FileTask = {
    ...withScheduledRepeater('2026-05-12', dailyRepeater),
    doneDates: [
      '2026-05-12',
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
      '2026-05-18',
      '2026-05-19',
    ],
  };
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result).toBeUndefined();
});

test('getFirstUnfinishedOccurrence_nonRecurringDone_returnsUndefined', () => {
  const task: FileTask = {
    ...withScheduled('2026-05-14'),
    doneDates: ['2026-05-14'],
  };
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result).toBeUndefined();
});

test('getFirstUnfinishedOccurrence_nonRecurringNotDone_returnsBase', () => {
  const task = withScheduled('2026-05-14');
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result?.toISOString().slice(0, 10)).toBe('2026-05-14');
});

test('getFirstUnfinishedOccurrence_outsideWindow_returnsUndefined', () => {
  const task = withScheduled('2026-06-01');
  const result = getFirstUnfinishedOccurrence(task, now, 0, 7);
  expect(result).toBeUndefined();
});

test('isOverdue_returnsTrue_forPastScheduledDate', () => {
  expect(isOverdue(withScheduled('2026-05-11'), now)).toBe(true);
});

test('isOverdue_returnsFalse_forToday', () => {
  expect(isOverdue(withScheduled('2026-05-12'), now)).toBe(false);
});

test('isOverdue_returnsFalse_forFutureDate', () => {
  expect(isOverdue(withScheduled('2026-05-13'), now)).toBe(false);
});

// REGRESSION: Bug 3 — viewing Tomorrow on task completed today: checkbox should be unchecked
test('isCompletedOn_taskWithDoneOnSameDate_returnsTrue', () => {
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
    doneDates: ['2026-05-12', '2026-05-14'],
  };
  expect(isCompletedOn(task, new Date('2026-05-14T12:00:00'))).toBe(true);
  expect(isCompletedOn(task, new Date('2026-05-12T12:00:00'))).toBe(true);
});

test('isCompletedOn_taskWithoutDoneOnViewDate_returnsFalse', () => {
  // bug from user: task completed today, viewing tomorrow — must be unchecked
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
    doneDates: ['2026-05-14'],
  };
  expect(isCompletedOn(task, new Date('2026-05-15T12:00:00'))).toBe(false);
  expect(isCompletedOn(task, new Date('2026-05-13T12:00:00'))).toBe(false);
});

test('isCompletedOn_taskWithoutDoneDates_returnsFalse', () => {
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
  };
  expect(isCompletedOn(task, new Date('2026-05-14T12:00:00'))).toBe(false);
});

test('isCompletedOn_taskWithEmptyDoneDates_returnsFalse', () => {
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
    doneDates: [],
  };
  expect(isCompletedOn(task, new Date('2026-05-14T12:00:00'))).toBe(false);
});

test('isCompletedToday_isWrapperForIsCompletedOnToday', () => {
  // isCompletedToday should be equivalent to isCompletedOn(task, now)
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
    doneDates: ['2026-05-14'],
  };
  const today = new Date('2026-05-14T12:00:00');
  expect(isCompletedToday(task, today)).toBe(isCompletedOn(task, today));
  expect(isCompletedToday(task, today)).toBe(true);
});

// REGRESSION: Bug 1 — DONE tasks should NOT appear in Overdue
test('isOverdue_doneTaskWithPastDate_returnsFalse', () => {
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'done',
    text: 'Done task',
    scheduled: { date: '2026-05-10', active: true, hasTime: false, start: 0, end: 0 },
  };
  expect(isOverdue(task, now)).toBe(false);
});

test('isOverdue_doneTaskWithDeadlinePast_returnsFalse', () => {
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'done',
    text: 'Done task',
    deadline: { date: '2026-05-10', active: true, hasTime: false, start: 0, end: 0 },
  };
  expect(isOverdue(task, now)).toBe(false);
});

// REGRESSION: Bug 2 — recurring task completed today should stay visible in Today/Next7Days
test('isToday_recurringCompletedToday_advancedScheduled_returnsTrue', () => {
  // After DONE: scheduled advanced to tomorrow, lastDoneAt = today
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Daily task',
    scheduled: {
      date: '2026-05-13',
      active: true,
      hasTime: false,
      start: 0,
      end: 0,
      repeater: dailyRepeater,
    },
    lastDoneAt: '2026-05-12',
  };
  expect(isToday(task, now)).toBe(true);
});

test('isNextSevenDays_recurringCompletedToday_advancedScheduled_returnsTrue', () => {
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Daily task',
    scheduled: {
      date: '2026-05-13',
      active: true,
      hasTime: false,
      start: 0,
      end: 0,
      repeater: dailyRepeater,
    },
    lastDoneAt: '2026-05-12',
  };
  expect(isNextSevenDays(task, now)).toBe(true);
});

test('isTomorrow_recurringCompletedToday_advancedToTomorrow_returnsTrue', () => {
  // base = tomorrow → projection occurrence есть на завтра, не зависит от lastDoneAt
  const task: FileTask = {
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Daily task',
    scheduled: {
      date: '2026-05-13',
      active: true,
      hasTime: false,
      start: 0,
      end: 0,
      repeater: dailyRepeater,
    },
    lastDoneAt: '2026-05-12',
  };
  expect(isTomorrow(task, now)).toBe(true);
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

test('isCompletedToday_returnsTrue_forToday', () => {
  expect(isCompletedToday(withLastDoneAt('2026-05-12'), now)).toBe(true);
});

test('isCompletedToday_usesLocalDayForLogbookDate', () => {
  const originalTimeZone = process.env.TZ;
  process.env.TZ = 'Australia/Sydney';
  try {
    expect(isCompletedToday(withLastDoneAt('2026-05-14'), new Date(2026, 4, 14, 3, 19))).toBe(true);
  } finally {
    process.env.TZ = originalTimeZone;
  }
});

test('isCompletedToday_returnsFalse_forYesterday', () => {
  expect(isCompletedToday(withLastDoneAt('2026-05-11'), now)).toBe(false);
});

test('isCompletedToday_returnsFalse_withoutLastDoneAt', () => {
  expect(isCompletedToday(withLastDoneAt(), now)).toBe(false);
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
