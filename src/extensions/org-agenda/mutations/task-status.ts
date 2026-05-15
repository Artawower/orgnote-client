import { editOrgDocument } from 'orgnote-api/utils';

export const changeTaskStatus = (
  content: string,
  headlineStart: number,
  newKeyword: string,
): string | undefined => {
  let applied = false;
  const next = editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h || h.todoKeyword === undefined) return;
    h.setTodoKeyword(newKeyword);
    applied = true;
  });
  return applied ? next : undefined;
};
