import { editOrgDocument } from 'orgnote-api/utils';

export const deleteTask = (content: string, headlineStart: number): string =>
  editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h) return;
    h.remove();
  });
