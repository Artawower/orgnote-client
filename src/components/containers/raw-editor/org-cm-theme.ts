import { EditorView } from 'codemirror';

const cursorColor = 'var(--fg)';

export const basicOrgTheme = EditorView.theme({
  '.cm-content': {
    caretColor: cursorColor,
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursorColor },

  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection, .cm-line ::selection':
    { backgroundColor: 'var(--cyan) !important', color: 'var(--bg)' },

  '.cm-gutterElement': {
    color: 'var(--fg-alt)',
    display: 'flex',
    'align-items': 'center',
    'margin-top': '4px',
  },

  '&.cm-focused': {
    outline: 'none',
  },

  '.cm-gutterElement:hover': {
    color: 'var(--cyan)',
  },

  '.cm-foldPlaceholder': {
    backgroundColor: 'none',
    background: 'none',
    color: 'var(--fg-alt)',
    fontSize: 'inherit',
    border: 0,
  },
});
