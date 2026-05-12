import { describe, expect, test } from 'vitest';
import { nextDateFromRepeater } from './repeater';
import type { OrgDate } from 'org-mode-ast';

const makeScheduled = (date: string, type: string, value: number, unit: string): OrgDate => ({
  date,
  active: true,
  hasTime: false,
  start: 0,
  end: 0,
  repeater: { type: type as '+', value, unit: unit as 'd' },
});

const completed = new Date('2026-05-12T22:00:00');

describe('nextDateFromRepeater', () => {
  test('returns original date when no repeater', () => {
    const scheduled: OrgDate = {
      date: '2026-05-10',
      active: true,
      hasTime: false,
      start: 0,
      end: 0,
    };
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-05-10');
  });

  test('+ adds interval to scheduled date', () => {
    const scheduled = makeScheduled('2026-05-10', '+', 1, 'd');
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-05-11');
  });

  test('++ advances to next future date from scheduled', () => {
    const scheduled = makeScheduled('2026-05-01', '++', 3, 'd');
    // 01 → 04 → 07 → 10 → 13 (first > 2026-05-12)
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-05-13');
  });

  test('.+ adds interval from completion date', () => {
    const scheduled = makeScheduled('2026-05-01', '.+', 7, 'd');
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-05-19');
  });

  test('+ with weekly interval', () => {
    const scheduled = makeScheduled('2026-05-05', '+', 1, 'w');
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-05-12');
  });

  test('returns original date for unsupported repeater type', () => {
    const scheduled = makeScheduled('2026-05-10', '-', 1, 'd');
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-05-10');
  });

  test('+ with monthly interval uses calendar months not 30 days', () => {
    const scheduled = makeScheduled('2026-01-31', '+', 1, 'm');
    // calendar +1m from Jan 31 = Feb 28 (not Mar 02)
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2026-02-28');
  });

  test('+ with yearly interval respects leap years', () => {
    const scheduled = makeScheduled('2024-02-29', '+', 1, 'y');
    // 2025 is not leap, Feb 29 → Feb 28
    expect(nextDateFromRepeater(scheduled, completed)).toBe('2025-02-28');
  });
});
