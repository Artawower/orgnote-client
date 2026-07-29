import { expect, test } from 'vitest';
import type { FileMeta, FileTask } from 'orgnote-api';
import {
  createFocusCalendarEntries,
  extractFocusIntervals,
  selectFocusIntervals,
} from './focus-statistics';

const task = {
  id: 'write-notes',
  text: 'Write notes',
  start: 42,
  clocks: [
    { date: '2026-07-29T08:00:00', to: '2026-07-29T08:25:00' },
    { date: '2026-07-29T10:00:00', to: '2026-07-29T10:25:00' },
    { date: '2026-07-30T09:00:00', to: '2026-07-30T09:30:00' },
    { date: '2026-07-30T11:00:00' },
    { date: '2026-07-30T13:00:00', to: '2026-07-30T12:00:00' },
  ],
} as FileTask;

const files: readonly FileMeta[] = [
  {
    id: 'project',
    filePath: ['notes', 'project.org'],
    title: 'Project',
    tasks: [task],
  },
];

const intervals = extractFocusIntervals(files);

test('focus statistics preserve every completed CLOCK interval', () => {
  expect(intervals).toHaveLength(3);
  expect(intervals.map(({ taskText }) => taskText)).toEqual([
    'Write notes',
    'Write notes',
    'Write notes',
  ]);
  expect(intervals[0]).toMatchObject({
    date: '2026-07-30',
    durationMin: 30,
    filePath: '/notes/project.org',
    fileTitle: 'Project',
    taskStart: 42,
  });
});

test('focus statistics aggregate calendar duration by local date', () => {
  expect(createFocusCalendarEntries(intervals)).toEqual(
    expect.arrayContaining([
      { date: '2026-07-29', value: 50 },
      { date: '2026-07-30', value: 30 },
    ]),
  );
});

test('focus statistics select intervals without merging repeated tasks', () => {
  expect(selectFocusIntervals(intervals, '2026-07-29')).toHaveLength(2);
});
