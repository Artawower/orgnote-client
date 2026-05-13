import type { FileMeta } from 'orgnote-api';
import type { OrgDate, OrgRepeater } from 'org-mode-ast';
import { addInterval } from './repeater';

type FileTask = NonNullable<FileMeta['tasks']>[number];
type ConstantRepeater = OrgRepeater & { unit: 'h' | 'd' | 'w' };
type CalendarRepeater = OrgRepeater & { unit: 'm' | 'y' };

const msPerDay = 24 * 60 * 60 * 1000;
const msPerUnit = {
  h: 60 * 60 * 1000,
  d: msPerDay,
  w: 7 * msPerDay,
} as const;

const toUtcMidnight = (isoDate: string): Date => new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);

const addUtcDays = (date: Date, days: number): Date => new Date(date.getTime() + days * msPerDay);

const dayDiff = (date: Date, now: Date): number =>
  Math.round(
    (toUtcMidnight(date.toISOString()).getTime() - toUtcMidnight(now.toISOString()).getTime()) /
      msPerDay,
  );

const parseScheduledBase = (scheduled: OrgDate): Date | undefined => {
  if (!scheduled.date) return undefined;
  const parsed = toUtcMidnight(scheduled.date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isConstantStep = (repeater: OrgRepeater): repeater is ConstantRepeater =>
  repeater.unit === 'h' || repeater.unit === 'd' || repeater.unit === 'w';

const isCalendarStep = (repeater: OrgRepeater): repeater is CalendarRepeater =>
  repeater.unit === 'm' || repeater.unit === 'y';

const firstConstantOccurrenceOnOrAfter = (
  base: Date,
  repeater: ConstantRepeater,
  target: Date,
): Date | undefined => {
  const stepMs = repeater.value * msPerUnit[repeater.unit];
  if (base >= target) return base;
  if (stepMs <= 0) return undefined;
  const distance = target.getTime() - base.getTime();
  const steps = Math.ceil(distance / stepMs);
  return new Date(base.getTime() + steps * stepMs);
};

const firstCalendarOccurrenceOnOrAfter = (
  base: Date,
  repeater: CalendarRepeater,
  target: Date,
): Date | undefined => {
  if (base >= target) return base;
  if (repeater.value <= 0) return undefined;
  return findCalendarOccurrence(base, repeater, target);
};

const findCalendarOccurrence = (
  base: Date,
  repeater: CalendarRepeater,
  target: Date,
): Date | undefined => {
  let current = base;
  for (let safety = 0; safety < 1000 && current < target; safety += 1) {
    const next = addInterval(current, repeater);
    if (next.getTime() <= current.getTime()) return undefined;
    current = next;
  }
  return current >= target ? current : undefined;
};

const firstOccurrenceOnOrAfter = (scheduled: OrgDate, target: Date): Date | undefined => {
  const base = parseScheduledBase(scheduled);
  if (!base) return undefined;
  if (!scheduled.repeater) return base >= target ? base : undefined;
  if (isConstantStep(scheduled.repeater)) {
    return firstConstantOccurrenceOnOrAfter(base, scheduled.repeater, target);
  }
  if (isCalendarStep(scheduled.repeater)) {
    return firstCalendarOccurrenceOnOrAfter(base, scheduled.repeater, target);
  }
  return undefined;
};

const firstTaskDate = (task: FileTask): OrgDate | undefined => task.scheduled ?? task.deadline;

const hasOccurrenceInRange = (
  task: FileTask,
  startOffset: number,
  endOffset: number,
  now = new Date(),
): boolean => {
  const scheduled = firstTaskDate(task);
  if (!scheduled?.date) return false;
  const today = toUtcMidnight(now.toISOString());
  const windowStart = addUtcDays(today, startOffset);
  const windowEnd = addUtcDays(today, endOffset);
  const first = firstOccurrenceOnOrAfter(scheduled, windowStart);
  return !!first && first <= windowEnd;
};

export const isToday = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 0, now);

export const isTomorrow = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 1, 1, now);

export const isNextSevenDays = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 7, now);

export const isOverdue = (task: FileTask, now = new Date()): boolean => {
  if (task.scheduled?.repeater) return false;
  const isoDate = task.deadline?.date ?? task.scheduled?.date;
  if (!isoDate) return false;
  return dayDiff(toUtcMidnight(isoDate), now) < 0;
};

export const hasNoDate = (task: FileTask): boolean => !task.scheduled?.date && !task.deadline?.date;
