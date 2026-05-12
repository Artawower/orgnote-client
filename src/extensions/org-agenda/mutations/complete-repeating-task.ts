import { mutateHeadline } from './core/mutate-headline';
import { buildTodoKeywordEdit } from './core/build-todo-keyword-edit';
import { buildAdvanceRepeaterEdits } from './core/build-advance-repeater-edits';
import { TASK_TODO_KEYWORD } from '../constants';

export const completeRepeatingTask = (
  content: string,
  headlineStart: number,
  completedAt: Date,
): string | undefined =>
  mutateHeadline(content, headlineStart, [
    (ctx) => buildTodoKeywordEdit(ctx, TASK_TODO_KEYWORD),
    (ctx) => buildAdvanceRepeaterEdits(ctx, completedAt),
  ]);
