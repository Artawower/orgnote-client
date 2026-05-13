import { mutateHeadline } from './core/mutate-headline';
import { buildTodoKeywordEdit } from './core/build-todo-keyword-edit';
import { buildClosedEdit } from './core/build-closed-edit';
import { buildLogStateChangeEdit } from './core/build-log-state-change-edit';
import { TASK_DONE_KEYWORD, TASK_TODO_KEYWORD } from '../constants';

export const reopenTask = (
  content: string,
  headlineStart: number,
  now = new Date(),
): string | undefined =>
  mutateHeadline(content, headlineStart, [
    (ctx) => buildTodoKeywordEdit(ctx, TASK_TODO_KEYWORD),
    (ctx) => buildClosedEdit(ctx, null),
    (ctx) => buildLogStateChangeEdit(ctx, TASK_DONE_KEYWORD, TASK_TODO_KEYWORD, now),
  ]);
