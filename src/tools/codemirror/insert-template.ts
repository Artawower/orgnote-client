import { EditorView } from 'codemirror';

export function insertTemplate(
  editorView: EditorView,
  text: string,
  focusOffset = 0
): void {
  const currentLine = editorView.state.doc.lineAt(
    editorView.state.selection.main.head
  );

  const insertFromPos = currentLine.from;
  const insertToPos = currentLine.to;
  editorView.dispatch({
    changes: { from: insertFromPos, to: insertToPos, insert: text },
  });

  const caretPos = insertFromPos + (focusOffset || text.length);

  editorView.dispatch({
    selection: {
      anchor: caretPos,
      head: caretPos,
    },
  });
  editorView.focus();
}
