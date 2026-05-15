import { editOrgDocument } from 'orgnote-api/utils';
import { TASK_DONE_KEYWORD, TASK_TODO_KEYWORD } from '../constants';

export const completeTask = (
  content: string,
  headlineStart: number,
  completedAt: Date,
): string | undefined => {
  let applied = false;
  const next = editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h || h.todoKeyword === undefined) return;
    const fromKeyword = h.todoKeyword ?? TASK_TODO_KEYWORD;
    h.setTodoKeyword(TASK_DONE_KEYWORD);
    h.closed.set(completedAt);
    h.logbook.appendStateChange({
      from: fromKeyword,
      to: TASK_DONE_KEYWORD,
      at: completedAt,
    });
    applied = true;
  });
  return applied ? next : undefined;
};
