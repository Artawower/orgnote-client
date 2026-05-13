import { mutateHeadline } from './core/mutate-headline';
import { buildTodoKeywordEdit } from './core/build-todo-keyword-edit';
import { buildClosedEdit } from './core/build-closed-edit';
import { buildLogStateChangeEdit } from './core/build-log-state-change-edit';
import type { HeadlineContext } from './core/headline-context';
import { TASK_DONE_KEYWORD, TASK_TODO_KEYWORD } from '../constants';

const getCurrentTodoKeyword = (ctx: HeadlineContext): string =>
  ctx.heading?.todoKeyword ?? TASK_TODO_KEYWORD;

export const completeTask = (
  content: string,
  headlineStart: number,
  completedAt: Date,
): string | undefined =>
  mutateHeadline(content, headlineStart, [
    (ctx) => buildTodoKeywordEdit(ctx, TASK_DONE_KEYWORD),
    (ctx) => buildClosedEdit(ctx, completedAt),
    (ctx) =>
      buildLogStateChangeEdit(ctx, getCurrentTodoKeyword(ctx), TASK_DONE_KEYWORD, completedAt),
  ]);
