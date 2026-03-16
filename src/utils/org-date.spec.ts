import { expect, test } from 'vitest';
import {
  formatCalendarDate,
  formatOrgDate,
  parseCalendarDate,
  parseOrgDate,
  updateOrgDateCalendar,
} from './org-date';

test('formatCalendarDate returns slash separated date', () => {
  expect(formatCalendarDate(new Date(2025, 2, 16))).toBe('2025/03/16');
});

test('parseCalendarDate returns parsed date for valid value', () => {
  const result = parseCalendarDate('2025/03/16');
  expect(result).toBeInstanceOf(Date);
  expect(result?.getFullYear()).toBe(2025);
  expect(result?.getMonth()).toBe(2);
  expect(result?.getDate()).toBe(16);
});

test('parseCalendarDate returns undefined for invalid value', () => {
  expect(parseCalendarDate('2025-03-16')).toBeUndefined();
});

test('parseCalendarDate rejects rollover dates', () => {
  expect(parseCalendarDate('2025/02/31')).toBeUndefined();
});

test('formatOrgDate formats active org date with trailing space when requested', () => {
  const result = formatOrgDate(new Date(2025, 2, 16), { trailingSpace: true });
  expect(result).toMatch(/^<2025-03-16 \w+> $/);
});

test('parseOrgDate extracts suffix and brackets', () => {
  const result = parseOrgDate('[2025-03-16 Sun 10:00-11:00 +1w]');
  expect(result).toMatchObject({
    openingBracket: '[',
    closingBracket: ']',
    suffix: ' 10:00-11:00 +1w',
  });
  expect(result?.date.getFullYear()).toBe(2025);
  expect(result?.date.getMonth()).toBe(2);
  expect(result?.date.getDate()).toBe(16);
  expect(result?.comparisonDate.getHours()).toBe(10);
  expect(result?.comparisonDate.getMinutes()).toBe(0);
});

test('parseOrgDate rejects rollover org dates', () => {
  expect(parseOrgDate('<2025-02-31 Mon>')).toBeUndefined();
});

test('updateOrgDateCalendar preserves time and inactive brackets', () => {
  const result = updateOrgDateCalendar('[2025-03-16 Sun 10:00-11:00 +1w]', '2025/03/20');
  expect(result).toMatch(/^\[2025-03-20 \w+ 10:00-11:00 \+1w\]$/);
});

test('updateOrgDateCalendar returns undefined for invalid org date', () => {
  expect(updateOrgDateCalendar('not-a-date', '2025/03/20')).toBeUndefined();
});
