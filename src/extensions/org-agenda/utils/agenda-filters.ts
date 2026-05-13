import type { FileMeta } from 'orgnote-api';
import type { OrgDate } from 'org-mode-ast';

type FileTask = NonNullable<FileMeta['tasks']>[number];

const msPerDay = 24 * 60 * 60 * 1000;

const toUtcMidnight = (isoDate: string): Date => new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);

const dayDiff = (date: Date, now: Date): number =>
  Math.round(
    (toUtcMidnight(date.toISOString()).getTime() - toUtcMidnight(now.toISOString()).getTime()) /
      msPerDay,
  );

const firstTaskDate = (task: FileTask): OrgDate | undefined => task.scheduled ?? task.deadline;

const hasDayOffset = (date: OrgDate | undefined, offset: number, now: Date): boolean => {
  if (!date?.date) return false;
  return dayDiff(toUtcMidnight(date.date), now) === offset;
};

export const isToday = (task: FileTask, now = new Date()): boolean =>
  hasDayOffset(firstTaskDate(task), 0, now);

export const isTomorrow = (task: FileTask, now = new Date()): boolean =>
  hasDayOffset(firstTaskDate(task), 1, now);

export const isNextSevenDays = (task: FileTask, now = new Date()): boolean => {
  const date = firstTaskDate(task);
  if (!date?.date) return false;
  const diff = dayDiff(toUtcMidnight(date.date), now);
  return diff >= 0 && diff <= 7;
};

export const isOverdue = (task: FileTask, now = new Date()): boolean => {
  const isoDate = task.deadline?.date ?? task.scheduled?.date;
  if (!isoDate) return false;
  return dayDiff(toUtcMidnight(isoDate), now) < 0;
};

export const hasNoDate = (task: FileTask): boolean => !task.scheduled?.date && !task.deadline?.date;
