import type { FileMeta } from 'orgnote-api';

type FileTask = NonNullable<FileMeta['tasks']>[number];

const msPerDay = 24 * 60 * 60 * 1000;

const toUtcMidnight = (isoDate: string): Date => new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);

const toNowMidnight = (now: Date): Date => toUtcMidnight(now.toISOString());

const dayDiff = (taskDate: Date, now: Date): number =>
  Math.round((taskDate.getTime() - toNowMidnight(now).getTime()) / msPerDay);

const parseDate = (isoDate: string | undefined): Date | undefined => {
  if (!isoDate) return undefined;
  const d = toUtcMidnight(isoDate);
  return isNaN(d.getTime()) ? undefined : d;
};

const scheduledDate = (task: FileTask): Date | undefined => parseDate(task.scheduled?.date);

const deadlineDate = (task: FileTask): Date | undefined => parseDate(task.deadline?.date);

const deadlineFirstDate = (task: FileTask): Date | undefined =>
  deadlineDate(task) ?? scheduledDate(task);

const scheduledFirstDate = (task: FileTask): Date | undefined =>
  scheduledDate(task) ?? deadlineDate(task);

export const isOverdue = (task: FileTask, now = new Date()): boolean => {
  const date = deadlineFirstDate(task);
  return !!date && dayDiff(date, now) < 0;
};

export const isToday = (task: FileTask, now = new Date()): boolean => {
  const date = scheduledFirstDate(task);
  return !!date && dayDiff(date, now) === 0;
};

export const isTomorrow = (task: FileTask, now = new Date()): boolean => {
  const date = scheduledFirstDate(task);
  return !!date && dayDiff(date, now) === 1;
};

export const isNextSevenDays = (task: FileTask, now = new Date()): boolean => {
  const date = scheduledFirstDate(task);
  if (!date) return false;
  const diff = dayDiff(date, now);
  return diff >= 0 && diff <= 7;
};

export const hasNoDate = (task: FileTask): boolean => !task.scheduled?.date && !task.deadline?.date;
