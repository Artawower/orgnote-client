import { expect, test } from 'vitest';
import type { FileMeta } from 'orgnote-api';
import { isAgendaEligible } from './use-agenda-tasks';

type FileTask = NonNullable<FileMeta['tasks']>[number];

const baseTask = (kind: FileTask['kind']): FileTask => ({
  id: '1',
  kind,
  state: 'todo',
  text: 'Task',
});

test('isAgendaEligible_acceptsHeadlineTodo', () => {
  expect(isAgendaEligible(baseTask('headline-todo'))).toBe(true);
});

test('isAgendaEligible_acceptsHeadlineCheckbox', () => {
  expect(isAgendaEligible(baseTask('headline-checkbox'))).toBe(true);
});

test('isAgendaEligible_rejectsListCheckbox', () => {
  expect(isAgendaEligible(baseTask('list-checkbox'))).toBe(false);
});
