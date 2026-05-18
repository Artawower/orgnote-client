import { EditorView } from '@codemirror/view';

export const orgInlineTheme = EditorView.theme({
  '&': {
    background: 'transparent !important',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  '.cm-content': {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '0',
  },
  '.cm-line': {
    padding: '0',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
});
