import type { ClockEntry } from 'org-mode-ast';

const msPerDay = 24 * 60 * 60 * 1000;

const toUtcCalendarDay = (isoDate: string): string => isoDate.slice(0, 10);

const toUtcMidnight = (calendarDay: string): Date => new Date(`${calendarDay}T00:00:00Z`);

const daysBetween = (earlier: Date, later: Date): number =>
  Math.round((later.getTime() - earlier.getTime()) / msPerDay);

const uniqueClockDays = (clocks: ClockEntry[]): Set<string> =>
  clocks.reduce<Set<string>>((days, clock) => {
    if (clock.date) days.add(toUtcCalendarDay(clock.date));
    return days;
  }, new Set());

export const calcTotalDays = (clocks: ClockEntry[]): number => uniqueClockDays(clocks).size;

export const calcCurrentStreak = (clocks: ClockEntry[], now = new Date()): number => {
  const today = toUtcCalendarDay(now.toISOString());
  const days = [...uniqueClockDays(clocks)].sort().reverse();

  if (!days.length) return 0;

  const gap = daysBetween(toUtcMidnight(days[0]!), toUtcMidnight(today));
  if (gap > 1) return 0;

  const breakIndex = days
    .slice(1)
    .findIndex((day, i) => daysBetween(toUtcMidnight(day), toUtcMidnight(days[i]!)) !== 1);

  return breakIndex === -1 ? days.length : breakIndex + 1;
};
