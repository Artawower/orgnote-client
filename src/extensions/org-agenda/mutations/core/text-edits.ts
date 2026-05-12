export interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

const editsOverlap = (a: TextEdit, b: TextEdit): boolean => a.start < b.end && b.start < a.end;

const assertNoOverlap = (edits: TextEdit[]): void => {
  const sorted = [...edits].sort((a, b) => a.start - b.start);
  sorted.forEach((edit, i) => {
    const next = sorted[i + 1];
    if (next && editsOverlap(edit, next))
      throw new Error(
        `Overlapping text edits: [${edit.start}, ${edit.end}) and [${next.start}, ${next.end})`,
      );
  });
};

export const applyTextEdits = (content: string, edits: TextEdit[]): string => {
  if (!edits.length) return content;
  assertNoOverlap(edits);
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (acc, edit) => acc.slice(0, edit.start) + edit.replacement + acc.slice(edit.end),
      content,
    );
};
