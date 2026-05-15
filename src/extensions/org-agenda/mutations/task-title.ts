import { editOrgDocument } from 'orgnote-api/utils';

export const changeTaskTitle = (
  content: string,
  headlineStart: number,
  newTitle: string,
): string | undefined => {
  let applied = false;
  const next = editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h || !h.node.title) return;
    h.setTitle(newTitle);
    applied = true;
  });
  return applied ? next : undefined;
};
