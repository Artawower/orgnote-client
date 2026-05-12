import { expect, test } from 'vitest';
import { changeTaskStatus } from './task-status';

test('changeTaskStatus_changesKeyword_fromTodoToDone', () => {
  expect(changeTaskStatus('* TODO My task\nsome body', 0, 'DONE')).toBe(
    '* DONE My task\nsome body',
  );
});

test('changeTaskStatus_changesKeyword_fromDoneToTodo', () => {
  expect(changeTaskStatus('* DONE My task', 0, 'TODO')).toBe('* TODO My task');
});

test('changeTaskStatus_changesKeyword_toCustom', () => {
  expect(changeTaskStatus('* TODO My task', 0, 'WAIT')).toBe('* WAIT My task');
});

test('changeTaskStatus_returnsUndefined_whenHeadlineNotFound', () => {
  expect(changeTaskStatus('* TODO My task', 99, 'DONE')).toBeUndefined();
});

test('changeTaskStatus_returnsUndefined_whenNoTodoKeyword', () => {
  expect(changeTaskStatus('* My plain headline', 0, 'DONE')).toBeUndefined();
});
