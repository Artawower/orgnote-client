import { editOrgDocument } from 'orgnote-api/utils';

export const openClock = (
  content: string,
  headlineStart: number,
  startedAt: Date,
): string | undefined => {
  let applied = false;
  const next = editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h || !h.node.section) return;
    h.logbook.openClock(startedAt);
    applied = true;
  });
  return applied ? next : undefined;
};

export const closeClock = (
  content: string,
  headlineStart: number,
  startedAt: Date,
  endedAt: Date,
): string | undefined => {
  let closed = false;
  const next = editOrgDocument(content, (doc) => {
    const h = doc.headlineAt(headlineStart);
    if (!h || !h.node.section) return;
    closed = h.logbook.closeClock({ start: startedAt, end: endedAt });
  });
  return closed ? next : undefined;
};
