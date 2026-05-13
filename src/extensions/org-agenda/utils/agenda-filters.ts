import type { FileMeta } from 'orgnote-api';
import type { OrgDate, OrgRepeater } from 'org-mode-ast';
import { addInterval } from './repeater';

type FileTask = NonNullable<FileMeta['tasks']>[number];
type ConstantRepeater = OrgRepeater & { unit: 'h' | 'd' | 'w' };
type CalendarRepeater = OrgRepeater & { unit: 'm' | 'y' };

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CALENDAR_PROJECTION_LIMIT = 1000;
const msPerUnit = {
  h: 60 * 60 * 1000,
  d: MS_PER_DAY,
  w: 7 * MS_PER_DAY,
} as const;

const toUtcMidnight = (isoDate: string): Date => new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);

const addUtcDays = (date: Date, days: number): Date => new Date(date.getTime() + days * MS_PER_DAY);

const dayDiff = (date: Date, now: Date): number =>
  Math.round(
    (toUtcMidnight(date.toISOString()).getTime() - toUtcMidnight(now.toISOString()).getTime()) /
      MS_PER_DAY,
  );

const firstTaskDate = (task: FileTask): OrgDate | undefined => task.scheduled ?? task.deadline;

const parseTaskDate = (date: OrgDate): Date | undefined => {
  if (!date.date) return undefined;
  const parsed = toUtcMidnight(date.date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isConstantStep = (repeater: OrgRepeater): repeater is ConstantRepeater =>
  repeater.unit === 'h' || repeater.unit === 'd' || repeater.unit === 'w';

const isCalendarStep = (repeater: OrgRepeater): repeater is CalendarRepeater =>
  repeater.unit === 'm' || repeater.unit === 'y';

const hasConstantOccurrenceInRange = (
  base: Date,
  repeater: ConstantRepeater,
  windowStart: Date,
  windowEnd: Date,
): boolean => {
  if (repeater.value <= 0) return false;
  if (windowEnd < base) return false;
  if (windowStart <= base) return base <= windowEnd;
  const stepMs = repeater.value * msPerUnit[repeater.unit];
  const steps = Math.ceil((windowStart.getTime() - base.getTime()) / stepMs);
  const first = new Date(base.getTime() + steps * stepMs);
  return first <= windowEnd;
};

const hasCalendarOccurrenceInRange = (
  base: Date,
  repeater: CalendarRepeater,
  windowStart: Date,
  windowEnd: Date,
): boolean => {
  if (repeater.value <= 0) return false;
  let occurrence = base;
  for (
    let safety = 0;
    safety < CALENDAR_PROJECTION_LIMIT && occurrence < windowStart;
    safety += 1
  ) {
    const next = addInterval(occurrence, repeater);
    if (next.getTime() <= occurrence.getTime()) return false;
    occurrence = next;
  }
  return occurrence >= windowStart && occurrence <= windowEnd;
};

const hasDateOccurrenceInRange = (date: OrgDate, windowStart: Date, windowEnd: Date): boolean => {
  const base = parseTaskDate(date);
  if (!base) return false;
  if (!date.repeater) return base >= windowStart && base <= windowEnd;
  if (isConstantStep(date.repeater)) {
    return hasConstantOccurrenceInRange(base, date.repeater, windowStart, windowEnd);
  }
  if (isCalendarStep(date.repeater)) {
    return hasCalendarOccurrenceInRange(base, date.repeater, windowStart, windowEnd);
  }
  return false;
};

const hasOccurrenceInRange = (
  task: FileTask,
  startOffset: number,
  endOffset: number,
  now = new Date(),
): boolean => {
  const date = firstTaskDate(task);
  if (!date?.date) return false;
  const today = toUtcMidnight(now.toISOString());
  const windowStart = addUtcDays(today, startOffset);
  const windowEnd = addUtcDays(today, endOffset);
  return hasDateOccurrenceInRange(date, windowStart, windowEnd);
};

const isOverdueInternal = (task: FileTask, now: Date): boolean => {
  const isoDate = task.deadline?.date ?? task.scheduled?.date;
  if (!isoDate) return false;
  return dayDiff(toUtcMidnight(isoDate), now) < 0;
};

export const isToday = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 0, now) || isOverdueInternal(task, now);

export const isTomorrow = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 1, 1, now);

export const isNextSevenDays = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 7, now) || isOverdueInternal(task, now);

export const isOverdue = (task: FileTask, now = new Date()): boolean =>
  isOverdueInternal(task, now);

export const hasNoDate = (task: FileTask): boolean => !task.scheduled?.date && !task.deadline?.date;
