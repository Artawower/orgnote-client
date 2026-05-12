import { expect, test } from 'vitest';
import { parse, withMetaInfo } from 'org-mode-ast';
import { extractFileTasks } from './extract-file-tasks';

test('extractFileTasks_withNoTasks_returnsEmptyArray', () => {
  const content = '#+TITLE: Empty';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/empty.org');
  expect(tasks).toEqual([]);
});

test('extractFileTasks_withCheckboxes_extractsCorrectStates', () => {
  const content = '- [ ] Task 1\n- [X] Task 2\n- [ ] Task 3';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/checkboxes.org');

  expect(tasks).toHaveLength(3);
  expect(tasks.map((task) => task.kind)).toEqual([
    'list-checkbox',
    'list-checkbox',
    'list-checkbox',
  ]);
  expect(tasks.map((task) => task.state)).toEqual(['todo', 'done', 'todo']);
  expect(tasks.map((task) => task.text)).toEqual(['Task 1', 'Task 2', 'Task 3']);
});

test('extractFileTasks_withKeywords_extractsTodos', () => {
  const content = '* [ ] This is headline task\n*** [X] Another one done\n* DONE This is done task';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/headlines.org');

  expect(tasks).toHaveLength(3);
  expect(tasks.map((task) => task.kind)).toEqual([
    'headline-checkbox',
    'headline-checkbox',
    'headline-todo',
  ]);
  expect(tasks.map((task) => task.state)).toEqual(['todo', 'done', 'done']);
  expect(tasks.map((task) => task.text)).toEqual([
    'This is headline task',
    'Another one done',
    'This is done task',
  ]);
});

test('extractFileTasks_withPriorityAndTags_extractsAgendaFields', () => {
  const content = '* TODO [#A] My task :work:home:';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/agenda.org');

  expect(tasks).toHaveLength(1);
  expect(tasks[0]!.priority).toBe('A');
  expect(tasks[0]!.tags).toEqual(['work', 'home']);
  expect(tasks[0]!.todoKeyword).toBe('TODO');
  expect(tasks[0]!.text).toBe('My task');
});

test('extractFileTasks_withScheduledAndDeadline_extractsPlanningDates', () => {
  const content = '* TODO Task\nSCHEDULED: <2026-05-12 Mon> DEADLINE: <2026-05-20 Tue>';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/planning.org');

  expect(tasks).toHaveLength(1);
  expect(tasks[0]!.scheduled?.date).toBe('2026-05-12');
  expect(tasks[0]!.deadline?.date).toBe('2026-05-20');
});

test('extractFileTasks_withHabitProperty_setsIsHabit', () => {
  const content =
    '* TODO Meditate\nSCHEDULED: <2026-05-12 Mon .+1d>\n:PROPERTIES:\n:STYLE: habit\n:END:';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/habits.org');

  expect(tasks).toHaveLength(1);
  expect(tasks[0]!.isHabit).toBe(true);
});

test('extractFileTasks_withClockInLogbook_extractsClocks', () => {
  const content =
    '* TODO Task\n:LOGBOOK:\nCLOCK: [2026-05-11 Mon 10:00]--[2026-05-11 Mon 10:45] =>  0:45\n:END:';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/clocks.org');

  expect(tasks).toHaveLength(1);
  expect(tasks[0]!.clocks).toHaveLength(1);
  expect(tasks[0]!.clocks![0]!.date).toContain('2026-05-11');
});

test('extractFileTasks_withClosedDate_extractsClosed', () => {
  const content = '* DONE Task\nCLOSED: [2026-05-10 Sun 22:00]';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/closed.org');

  expect(tasks).toHaveLength(1);
  expect(tasks[0]!.closed?.date).toContain('2026-05-10');
});

test('extractFileTasks_listCheckbox_hasNoAgendaFields', () => {
  const content = '- [ ] Simple list task';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/list.org');

  expect(tasks).toHaveLength(1);
  expect(tasks[0]!.kind).toBe('list-checkbox');
  expect(tasks[0]!.scheduled).toBeUndefined();
  expect(tasks[0]!.deadline).toBeUndefined();
  expect(tasks[0]!.clocks).toBeUndefined();
  expect(tasks[0]!.isHabit).toBeUndefined();
  expect(tasks[0]!.todoKeyword).toBeUndefined();
  expect(tasks[0]!.priority).toBeUndefined();
});

test('extractFileTasks_setsStartEndOffsets', () => {
  const content = '- [ ] First\n- [ ] Middle\n- [ ] Last';
  const root = withMetaInfo(parse(content));
  const tasks = extractFileTasks(root, '/lines.org');

  expect(tasks).toHaveLength(3);
  expect(tasks.map((task) => [task.start, task.end])).toEqual([
    [0, 12],
    [12, 25],
    [25, 35],
  ]);
});
