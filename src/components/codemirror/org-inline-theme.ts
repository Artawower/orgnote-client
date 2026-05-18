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
  // CodeMirror base theme sets padding: "4px 0" on .cm-content and
  // padding: "0 2px 0 4px" on .cm-line — override both to zero.
  '.cm-content': {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '0',
    paddingLeft: '0',
  },
  '.cm-line': {
    padding: '0',
    paddingLeft: '0',
    paddingRight: '0',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
});
