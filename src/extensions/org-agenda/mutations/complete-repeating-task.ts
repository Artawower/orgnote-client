import { mutateHeadline } from './core/mutate-headline';
import { buildTodoKeywordEdit } from './core/build-todo-keyword-edit';
import { buildAdvanceRepeaterEdits } from './core/build-advance-repeater-edits';
import { buildLogStateChangeEdit } from './core/build-log-state-change-edit';
import type { HeadlineContext } from './core/headline-context';
import { TASK_DONE_KEYWORD, TASK_TODO_KEYWORD } from '../constants';

const getCurrentTodoKeyword = (ctx: HeadlineContext): string =>
  ctx.heading?.todoKeyword ?? TASK_TODO_KEYWORD;

export const completeRepeatingTask = (
  content: string,
  headlineStart: number,
  completedAt: Date,
): string | undefined =>
  mutateHeadline(content, headlineStart, [
    (ctx) => buildTodoKeywordEdit(ctx, TASK_TODO_KEYWORD),
    (ctx) => buildAdvanceRepeaterEdits(ctx, completedAt),
    (ctx) =>
      buildLogStateChangeEdit(ctx, getCurrentTodoKeyword(ctx), TASK_DONE_KEYWORD, completedAt),
  ]);
