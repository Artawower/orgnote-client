import { EditorView } from 'codemirror';

export function insertTemplate(params: {
  editorView: EditorView;
  template: string;
  focusOffset?: number;
  overrideLine?: boolean;
}): void {
  const { editorView, template } = params;
  const focusOffset = params.focusOffset || 0;

  const currentLine = editorView.state.doc.lineAt(
    editorView.state.selection.main.head
  );

  const cursorPosition = editorView.state.selection.main.head;

  const insertFromPos = params.overrideLine ? currentLine.from : cursorPosition;
  const insertToPos = params.overrideLine ? currentLine.to : cursorPosition;
  editorView.dispatch({
    changes: { from: insertFromPos, to: insertToPos, insert: template },
  });

  const caretPos = insertFromPos + (focusOffset || template.length);

  editorView.dispatch({
    selection: {
      anchor: caretPos,
      head: caretPos,
    },
  });
  setTimeout(() => editorView.focus());
}
