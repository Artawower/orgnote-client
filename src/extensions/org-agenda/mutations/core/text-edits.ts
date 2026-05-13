export interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

interface IndexedTextEdit extends TextEdit {
  index: number;
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

const indexEdit = (edit: TextEdit, index: number): IndexedTextEdit => ({ ...edit, index });

const compareApplicationOrder = (a: IndexedTextEdit, b: IndexedTextEdit): number =>
  b.start - a.start || b.index - a.index;

const applyEdit = (content: string, edit: TextEdit): string =>
  content.slice(0, edit.start) + edit.replacement + content.slice(edit.end);

export const applyTextEdits = (content: string, edits: TextEdit[]): string => {
  if (!edits.length) return content;
  assertNoOverlap(edits);
  return edits.map(indexEdit).sort(compareApplicationOrder).reduce(applyEdit, content);
};
