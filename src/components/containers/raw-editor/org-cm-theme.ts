import { EditorView } from 'codemirror';

export const basicOrgTheme = EditorView.theme({
  '.cm-content': {
    caretColor: 'var(--editor-caret-color)',
    width: '100%',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--editor-caret-color)',
  },

  '.cm-line': {
    padding: '0',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection, .cm-line ::selection':
    {
      backgroundColor: 'var(--editor-selection-bg-color) !important',
      color: 'var(--editor-selection-color) !important',
    },

  '.cm-gutterElement': {
    color: 'var(--editor-gutter-color)',
    display: 'flex',
    alignItems: 'start',
  },

  '.cm-gutterElement > span': {
    marginTop: '18px',
  },
  '&.cm-focused': {
    outline: 'none',
  },

  '.cm-gutterElement:hover': {
    color: 'var(--editor-gutter-hover-color)',
  },

  '.cm-foldPlaceholder': {
    backgroundColor: 'none',
    background: 'none',
    color: 'var(--editor-fold-placeholder-color)',
    fontSize: 'inherit',
    border: 0,
    display: 'none',
  },

  '.cm-activeLine': {
    'background-color': 'var(--editor-active-line-bg-color)',
  },

  '.cm-scroller': {
    overflowX: 'unset',
  },
});
