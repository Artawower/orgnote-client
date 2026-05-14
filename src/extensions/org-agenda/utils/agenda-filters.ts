import type { FileMeta } from 'orgnote-api';
import type { OrgDate, OrgRepeater } from 'org-mode-ast';
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInMilliseconds,
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns';

type FileTask = NonNullable<FileMeta['tasks']>[number];
type ConstantRepeater = OrgRepeater & { unit: 'h' | 'd' | 'w' };
type CalendarRepeater = OrgRepeater & { unit: 'm' | 'y' };

const CONSTANT_OCCURRENCE_LIMIT = 100;
const CALENDAR_PROJECTION_LIMIT = 1000;

const parseOrgDate = (isoDate: string): Date => startOfDay(parseISO(isoDate.slice(0, 10)));

const toDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

const firstTaskDate = (task: FileTask): OrgDate | undefined => task.scheduled ?? task.deadline;

const parseTaskDate = (date: OrgDate): Date | undefined => {
  if (!date.date) return undefined;
  const parsed = parseOrgDate(date.date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isConstantStep = (repeater: OrgRepeater): repeater is ConstantRepeater =>
  repeater.unit === 'h' || repeater.unit === 'd' || repeater.unit === 'w';

const isCalendarStep = (repeater: OrgRepeater): repeater is CalendarRepeater =>
  repeater.unit === 'm' || repeater.unit === 'y';

const buildWindow = (now: Date, startOffset: number, endOffset: number): [Date, Date] => {
  const today = startOfDay(now);
  return [addDays(today, startOffset), addDays(today, endOffset)];
};

const addConstantStep = (date: Date, repeater: ConstantRepeater, steps: number): Date => {
  const amount = repeater.value * steps;
  if (repeater.unit === 'h') return addHours(date, amount);
  if (repeater.unit === 'd') return addDays(date, amount);
  return addWeeks(date, amount);
};

const constantStepMilliseconds = (base: Date, repeater: ConstantRepeater): number =>
  differenceInMilliseconds(addConstantStep(base, repeater, 1), base);

const collectConstantOccurrences = (
  base: Date,
  repeater: ConstantRepeater,
  windowStart: Date,
  windowEnd: Date,
): Date[] => {
  const stepMs = constantStepMilliseconds(base, repeater);
  if (stepMs <= 0 || windowEnd < base) return [];
  const steps = windowStart <= base ? 0 : Math.ceil(differenceInMilliseconds(windowStart, base) / stepMs);
  return collectSteppedOccurrences(addConstantStep(base, repeater, steps), repeater, windowEnd);
};

const collectSteppedOccurrences = (
  first: Date,
  repeater: ConstantRepeater,
  windowEnd: Date,
): Date[] => {
  const occurrences: Date[] = [];
  for (
    let count = 0, current = first;
    current <= windowEnd && count < CONSTANT_OCCURRENCE_LIMIT;
    count += 1
  ) {
    occurrences.push(current);
    current = addConstantStep(current, repeater, 1);
  }
  return occurrences;
};

const addCalendarStep = (date: Date, repeater: CalendarRepeater): Date => {
  if (repeater.unit === 'm') return addMonths(date, repeater.value);
  return addYears(date, repeater.value);
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
    const next = addCalendarStep(occurrence, repeater);
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
    const next = addCalendarStep(current, repeater);
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
    (date) => !done.has(toDateKey(date)),
  );
};

export const findNextOccurrenceInRange = (
  task: FileTask,
  now: Date,
  daysAhead: number,
): Date | undefined => {
  const occurrences = getOccurrencesInRange(task, now, 0, daysAhead);
  if (!occurrences.length) return undefined;
  const done = new Set(getDoneDates(task));
  const firstUnfinished = occurrences.find((date) => !done.has(toDateKey(date)));
  return firstUnfinished ?? occurrences.at(-1);
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
  return differenceInCalendarDays(parseOrgDate(isoDate), now) < 0;
};

export const isToday = (task: FileTask, now = new Date()): boolean =>
  hasOccurrenceInRange(task, 0, 0, now) ||
  isOverdueInternal(task, now) ||
  isCompletedToday(task, now);

export const isTomorrow = (task: FileTask, now = new Date()): boolean => {
  if (hasOccurrenceInRange(task, 1, 1, now)) return true;
  return isCompletedOn(task, addDays(startOfDay(now), 1));
};

export const isNextSevenDays = (task: FileTask, now = new Date()): boolean =>
  findNextOccurrenceInRange(task, now, 7) !== undefined ||
  isOverdueInternal(task, now) ||
  isCompletedToday(task, now);

export const isOverdue = (task: FileTask, now = new Date()): boolean =>
  isOverdueInternal(task, now);

export const isCompletedOn = (task: FileTask, date: Date): boolean =>
  getDoneDates(task).some((doneDate) => isSameDay(parseOrgDate(doneDate), date));

export const isCompletedToday = (task: FileTask, now = new Date()): boolean =>
  isCompletedOn(task, now);

export const hasNoDate = (task: FileTask): boolean => !task.scheduled?.date && !task.deadline?.date;
