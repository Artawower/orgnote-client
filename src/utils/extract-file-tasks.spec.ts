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
