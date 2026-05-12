import { describe, expect, test } from 'vitest';
import { calcTotalDays, calcCurrentStreak } from './streak';
import type { ClockEntry } from 'org-mode-ast';

const clock = (date: string): ClockEntry => ({ date, start: 0, end: 0 });

describe('calcTotalDays', () => {
  test('returns 0 for empty clocks', () => {
    expect(calcTotalDays([])).toBe(0);
  });

  test('counts unique days ignoring time part', () => {
    const clocks = [
      clock('2026-05-10T10:00'),
      clock('2026-05-10T14:00'),
      clock('2026-05-11T09:00'),
    ];
    expect(calcTotalDays(clocks)).toBe(2);
  });

  test('ignores clocks without date', () => {
    const clocks = [{ start: 0, end: 0 }, clock('2026-05-10T10:00')];
    expect(calcTotalDays(clocks)).toBe(1);
  });
});

describe('calcCurrentStreak', () => {
  test('returns 0 for empty clocks', () => {
    expect(calcCurrentStreak([], new Date('2026-05-12'))).toBe(0);
  });

  test('returns 0 when latest clock is older than yesterday', () => {
    const clocks = [clock('2026-05-09T10:00')];
    expect(calcCurrentStreak(clocks, new Date('2026-05-12'))).toBe(0);
  });

  test('returns 1 when only today has a clock', () => {
    const clocks = [clock('2026-05-12T10:00')];
    expect(calcCurrentStreak(clocks, new Date('2026-05-12'))).toBe(1);
  });

  test('returns streak length for consecutive days ending today', () => {
    const clocks = [
      clock('2026-05-10T10:00'),
      clock('2026-05-11T10:00'),
      clock('2026-05-12T10:00'),
    ];
    expect(calcCurrentStreak(clocks, new Date('2026-05-12'))).toBe(3);
  });

  test('returns streak length for consecutive days ending yesterday', () => {
    const clocks = [
      clock('2026-05-09T10:00'),
      clock('2026-05-10T10:00'),
      clock('2026-05-11T10:00'),
    ];
    expect(calcCurrentStreak(clocks, new Date('2026-05-12'))).toBe(3);
  });

  test('stops streak at first gap', () => {
    const clocks = [
      clock('2026-05-08T10:00'),
      clock('2026-05-10T10:00'),
      clock('2026-05-11T10:00'),
      clock('2026-05-12T10:00'),
    ];
    expect(calcCurrentStreak(clocks, new Date('2026-05-12'))).toBe(3);
  });
});
