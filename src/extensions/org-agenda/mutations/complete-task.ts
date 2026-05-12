import { mutateHeadline } from './core/mutate-headline';
import { buildTodoKeywordEdit } from './core/build-todo-keyword-edit';
import { buildClosedEdit } from './core/build-closed-edit';
import { TASK_DONE_KEYWORD } from '../constants';

export const completeTask = (
  content: string,
  headlineStart: number,
  completedAt: Date,
): string | undefined =>
  mutateHeadline(content, headlineStart, [
    (ctx) => buildTodoKeywordEdit(ctx, TASK_DONE_KEYWORD),
    (ctx) => buildClosedEdit(ctx, completedAt),
  ]);
