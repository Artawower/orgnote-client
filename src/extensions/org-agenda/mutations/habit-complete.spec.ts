import { expect, test } from 'vitest';
import { completeHabit } from './habit-complete';

const habitDoc = `* DONE Meditate
SCHEDULED: <2026-05-12 Mon .+1d>
:PROPERTIES:
:STYLE: habit
:END:
`;

const completedAt = new Date('2026-05-12T10:00:00');

test('completeHabit_resetsStatus_toTodo', () => {
  expect(completeHabit(habitDoc, 0, completedAt)).toContain('* TODO Meditate');
});

test('completeHabit_advancesScheduledDate_byRepeater', () => {
  expect(completeHabit(habitDoc, 0, completedAt)).toContain('2026-05-13');
});

test('completeHabit_insertsClockEntry_intoLogbook', () => {
  const result = completeHabit(habitDoc, 0, completedAt);
  expect(result).toContain(':LOGBOOK:');
  expect(result).toContain('CLOCK:');
  expect(result).toContain(':END:');
});

test('completeHabit_returnsUndefined_whenHeadlineNotFound', () => {
  expect(completeHabit(habitDoc, 99, completedAt)).toBeUndefined();
});

test('completeHabit_returnsUndefined_whenNoScheduledRepeater', () => {
  expect(
    completeHabit('* TODO Task\nSCHEDULED: <2026-05-12 Mon>\n', 0, completedAt),
  ).toBeUndefined();
});
