import { EditorView } from 'codemirror';

const cursorColor = 'var(--fg)';

export const basicOrgTheme = EditorView.theme({
  '.cm-content': {
    caretColor: cursorColor,
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursorColor },

  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection, .cm-line ::selection':
    { backgroundColor: 'var(--teal) !important', color: 'var(--fg)' },
});
