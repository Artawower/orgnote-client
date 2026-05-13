import { buildRemoveLogStateChangeEdit } from './core/build-remove-log-state-change-edit';
import { mutateHeadline } from './core/mutate-headline';

export const undoRecurringCompletion = (
  content: string,
  headlineStart: number,
  doneDate: string,
): string | undefined =>
  mutateHeadline(content, headlineStart, [
    (ctx) => buildRemoveLogStateChangeEdit(ctx, 'DONE', doneDate),
  ]);
