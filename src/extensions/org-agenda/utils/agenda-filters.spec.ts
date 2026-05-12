import { describe, expect, test } from 'vitest';
import { isOverdue, isToday, isTomorrow, isNextSevenDays, hasNoDate } from './agenda-filters';
import type { FileMeta } from 'orgnote-api';

type FileTask = NonNullable<FileMeta['tasks']>[number];

const now = new Date('2026-05-12T12:00:00');

const taskWithScheduled = (date: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  scheduled: { date, active: true, hasTime: false, start: 0, end: 0 },
});

const taskWithDeadline = (date: string): FileTask => ({
  id: '1',
  kind: 'headline-todo',
  state: 'todo',
  text: 'Task',
  deadline: { date, active: true, hasTime: false, start: 0, end: 0 },
});

const noDateTask: FileTask = { id: '1', kind: 'headline-todo', state: 'todo', text: 'Task' };

describe('isOverdue', () => {
  test('returns true for past scheduled date', () => {
    expect(isOverdue(taskWithScheduled('2026-05-11'), now)).toBe(true);
  });

  test('returns false for today', () => {
    expect(isOverdue(taskWithScheduled('2026-05-12'), now)).toBe(false);
  });

  test('returns false for future date', () => {
    expect(isOverdue(taskWithScheduled('2026-05-13'), now)).toBe(false);
  });

  test('returns false for task without date', () => {
    expect(isOverdue(noDateTask, now)).toBe(false);
  });

  test('checks deadline when no scheduled', () => {
    expect(isOverdue(taskWithDeadline('2026-05-10'), now)).toBe(true);
  });
});

describe('isToday', () => {
  test('returns true for today', () => {
    expect(isToday(taskWithScheduled('2026-05-12'), now)).toBe(true);
  });

  test('returns false for yesterday', () => {
    expect(isToday(taskWithScheduled('2026-05-11'), now)).toBe(false);
  });

  test('returns false for tomorrow', () => {
    expect(isToday(taskWithScheduled('2026-05-13'), now)).toBe(false);
  });
});

describe('isTomorrow', () => {
  test('returns true for tomorrow', () => {
    expect(isTomorrow(taskWithScheduled('2026-05-13'), now)).toBe(true);
  });

  test('returns false for today', () => {
    expect(isTomorrow(taskWithScheduled('2026-05-12'), now)).toBe(false);
  });

  test('returns false for day after tomorrow', () => {
    expect(isTomorrow(taskWithScheduled('2026-05-14'), now)).toBe(false);
  });
});

describe('isNextSevenDays', () => {
  test('returns true for today', () => {
    expect(isNextSevenDays(taskWithScheduled('2026-05-12'), now)).toBe(true);
  });

  test('returns true for 7 days ahead', () => {
    expect(isNextSevenDays(taskWithScheduled('2026-05-19'), now)).toBe(true);
  });

  test('returns false for 8 days ahead', () => {
    expect(isNextSevenDays(taskWithScheduled('2026-05-20'), now)).toBe(false);
  });

  test('returns false for overdue task', () => {
    expect(isNextSevenDays(taskWithScheduled('2026-05-11'), now)).toBe(false);
  });
});

describe('hasNoDate', () => {
  test('returns true when no scheduled or deadline', () => {
    expect(hasNoDate(noDateTask)).toBe(true);
  });

  test('returns false when has scheduled', () => {
    expect(hasNoDate(taskWithScheduled('2026-05-12'))).toBe(false);
  });

  test('returns false when has deadline', () => {
    expect(hasNoDate(taskWithDeadline('2026-05-12'))).toBe(false);
  });
});

describe('deadline vs scheduled priority', () => {
  const taskBoth = (scheduledDate: string, deadlineDate: string): FileTask => ({
    id: '1',
    kind: 'headline-todo',
    state: 'todo',
    text: 'Task',
    scheduled: { date: scheduledDate, active: true, hasTime: false, start: 0, end: 0 },
    deadline: { date: deadlineDate, active: true, hasTime: false, start: 0, end: 0 },
  });

  test('isOverdue uses deadline even when scheduled is future', () => {
    const task = taskBoth('2026-05-13', '2026-05-11');
    expect(isOverdue(task, now)).toBe(true);
  });

  test('isToday uses scheduled when both present', () => {
    const task = taskBoth('2026-05-12', '2026-05-15');
    expect(isToday(task, now)).toBe(true);
  });

  test('isToday falls back to deadline when no scheduled', () => {
    expect(isToday(taskWithDeadline('2026-05-12'), now)).toBe(true);
  });
});
