import type { FileMeta } from 'orgnote-api';
import type { OrgDate, OrgRepeater } from 'org-mode-ast';
import { addInterval } from './repeater';

type FileTask = NonNullable<FileMeta['tasks']>[number];
type ConstantRepeater = OrgRepeater & { unit: 'h' | 'd' | 'w' };
type CalendarRepeater = OrgRepeater & { unit: 'm' | 'y' };

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CONSTANT_OCCURRENCE_LIMIT = 100;
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

const toLocalMidnight = (value: Date | string): Date => {
  if (typeof value !== 'string') {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
};

const localDayDiff = (date: Date, now: Date): number =>
  Math.round((toLocalMidnight(date).getTime() - toLocalMidnight(now).getTime()) / MS_PER_DAY);

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

const buildWindow = (now: Date, startOffset: number, endOffset: number): [Date, Date] => {
  const today = toUtcMidnight(now.toISOString());
  return [addUtcDays(today, startOffset), addUtcDays(today, endOffset)];
};

const collectConstantOccurrences = (
  base: Date,
  repeater: ConstantRepeater,
  windowStart: Date,
  windowEnd: Date,
): Date[] => {
  const stepMs = repeater.value * msPerUnit[repeater.unit];
  if (stepMs <= 0 || windowEnd < base) return [];
  const steps =
    windowStart <= base ? 0 : Math.ceil((windowStart.getTime() - base.getTime()) / stepMs);
  return collectSteppedOccurrences(new Date(base.getTime() + steps * stepMs), stepMs, windowEnd);
};

const collectSteppedOccurrences = (first: Date, stepMs: number, windowEnd: Date): Date[] => {
  const occurrences: Date[] = [];
  for (
    let count = 0, current = first;
    current <= windowEnd && count < CONSTANT_OCCURRENCE_LIMIT;
    count += 1
  ) {
    occurrences.push(current);
    current = new Date(current.getTime() + stepMs);
  }
  return occurrences;
};

const collectCalendarOccurrences = (
  base: Date,
  repeater: CalendarRepeater,
  windowStart: Date,
  windowEnd: Date,
): Date[] => {
  if (repeater.value <= 0) return [];
  const first = firstCalendarOccurrenceOnOrAfter(base, repeater, windowStart);
  if (!first) return [];
  return collectCalendarUntil(first, repeater, windowEnd);
};

const firstCalendarOccurrenceOnOrAfter = (
  base: Date,
  repeater: CalendarRepeater,
  windowStart: Date,
): Date | undefined => {
  let occurrence = base;
  for (
    let safety = 0;
    safety < CALENDAR_PROJECTION_LIMIT && occurrence < windowStart;
    safety += 1
  ) {
    const next = addInterval(occurrence, repeater);
    if (next.getTime() <= occurrence.getTime()) return undefined;
    occurrence = next;
  }
  return occurrence >= windowStart ? occurrence : undefined;
};

const collectCalendarUntil = (first: Date, repeater: CalendarRepeater, windowEnd: Date): Date[] => {
  const occurrences: Date[] = [];
  for (
    let safety = 0, current = first;
    current <= windowEnd && safety < CALENDAR_PROJECTION_LIMIT;
    safety += 1
  ) {
    occurrences.push(current);
    const next = addInterval(current, repeater);
    if (next.getTime() <= current.getTime()) return occurrences;
    current = next;
  }
  return occurrences;
};

const getDateOccurrencesInRange = (date: OrgDate, windowStart: Date, windowEnd: Date): Date[] => {
  const base = parseTaskDate(date);
  if (!base) return [];
  if (!date.repeater) return base >= windowStart && base <= windowEnd ? [base] : [];
  if (isConstantStep(date.repeater))
    return collectConstantOccurrences(base, date.repeater, windowStart, windowEnd);
  if (isCalendarStep(date.repeater))
    return collectCalendarOccurrences(base, date.repeater, windowStart, windowEnd);
  return [];
};

export const getOccurrencesInRange = (
  task: FileTask,
  now: Date,
  startOffset: number,
  endOffset: number,
): Date[] => {
  const date = firstTaskDate(task);
  if (!date?.date) return [];
  const [windowStart, windowEnd] = buildWindow(now, startOffset, endOffset);
  return getDateOccurrencesInRange(date, windowStart, windowEnd);
};

const getDoneDates = (task: FileTask): string[] => {
  if (task.doneDates?.length) return task.doneDates;
  return task.lastDoneAt ? [task.lastDoneAt] : [];
};

export const getFirstUnfinishedOccurrence = (
  task: FileTask,
  now: Date,
  startOffset: number,
  endOffset: number,
): Date | undefined => {
  const done = new Set(getDoneDates(task));
  return getOccurrencesInRange(task, now, startOffset, endOffset).find(
    (date) => !done.has(date.toISOString().slice(0, 10)),
  );
};

const hasOccurrenceInRange = (
  task: FileTask,
  startOffset: number,
  endOffset: number,
  now = new Date(),
): boolean => getOccurrencesInRange(task, now, startOffset, endOffset).length > 0;

const isOverdueInternal = (task: FileTask, now: Date): boolean => {
  if (task.state === 'done') return false;
  const isoDate = task.deadline?.date ?? task.scheduled?.date;
  if (!isoDate) return false;
  return dayDiff(toUtcMidnight(isoDate), now) < 0;
};

export const isToday = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 0, now) ||
  isOverdueInternal(task, now) ||
  isCompletedToday(task, now);

export const isTomorrow = (task: FileTask, now = new Date()): boolean => {
  if (hasOccurrenceInRange(task, 1, 1, now)) return true;
  const tomorrow = addUtcDays(toUtcMidnight(now.toISOString()), 1);
  return isCompletedOn(task, tomorrow);
};

export const isNextSevenDays = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 7, now) ||
  isOverdueInternal(task, now) ||
  isCompletedToday(task, now);

export const isOverdue = (task: FileTask, now = new Date()): boolean =>
  isOverdueInternal(task, now);

export const isCompletedOn = (task: FileTask, date: Date): boolean =>
  getDoneDates(task).some((doneDate) => localDayDiff(toLocalMidnight(doneDate), date) === 0);

export const isCompletedToday = (task: FileTask, now = new Date()): boolean =>
  isCompletedOn(task, now);

export const hasNoDate = (task: FileTask): boolean => !task.scheduled?.date && !task.deadline?.date;
