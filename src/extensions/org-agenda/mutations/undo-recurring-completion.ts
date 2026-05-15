import { editOrgDocument } from 'orgnote-api/utils';
import { TASK_DONE_KEYWORD } from '../constants';

export const undoRecurringCompletion = (
  content: string,
  headlineStart: number,
  doneDate: string,
): string | undefined => {
  let removed = false;
  const next = editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h) return;
    removed = h.logbook.removeStateChange({ to: TASK_DONE_KEYWORD, date: doneDate });
  });
  return removed ? next : undefined;
};
