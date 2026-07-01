import type { EditorExtension } from 'orgnote-api';
import { Prec } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import {
  EMBEDDED_WIDGET_COMMAND,
  EMBEDDED_WIDGET_DIRECTION,
  getEmbeddedWidgetBridge,
} from 'src/utils/org-editor/embedded-widget-runtime';

const TITLE_KEYWORD_LINE_PATTERN = /^#\+TITLE:/i;

const EDITOR_TITLE_DELETE_SOURCE_ID = 'editor-title-delete';

const isCollapsedSelection = (view: EditorView): boolean => view.state.selection.main.empty;

const editorTargetLineNumber = (view: EditorView, direction: -1 | 1): number | undefined => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const lineNumber = direction > 0 && head < line.to ? line.number : line.number + direction;
  if (lineNumber < 1 || lineNumber > view.state.doc.lines) return undefined;
  return lineNumber;
};

const focusTitleLineFallback = (view: EditorView, direction: -1 | 1): boolean => {
  const lineNumber = editorTargetLineNumber(view, direction);
  if (lineNumber === undefined) return false;

  const line = view.state.doc.line(lineNumber);
  if (!TITLE_KEYWORD_LINE_PATTERN.test(line.text)) return false;

  const anchor = direction > 0 ? line.from : line.to;
  view.dispatch({ selection: { anchor }, scrollIntoView: true });
  view.focus();
  return true;
};

export const focusEmbeddedWidgetFromEditor = (
  view: EditorView,
  direction: -1 | 1,
): boolean => {
  if (!isCollapsedSelection(view)) return false;

  const bridge = getEmbeddedWidgetBridge(view);
  const focused = bridge.dispatch({
    type: EMBEDDED_WIDGET_COMMAND.FocusFromEditor,
    payload: {
      direction,
      position: direction > 0 ? 'start' : 'end',
    },
  });
  return focused || focusTitleLineFallback(view, direction);
};

const deleteEmptyLineAfterTitle = (view: EditorView, titleLineTo: number, lineFrom: number): void => {
  view.dispatch({
    changes: { from: titleLineTo, to: lineFrom },
    selection: { anchor: titleLineTo },
    scrollIntoView: true,
  });
};

const focusTitleBeforeLine = (view: EditorView, lineFrom: number, lineTo: number): boolean =>
  getEmbeddedWidgetBridge(view).dispatch({
    type: EMBEDDED_WIDGET_COMMAND.Exit,
    payload: {
      sourceId: EDITOR_TITLE_DELETE_SOURCE_ID,
      range: { from: lineFrom, to: lineTo },
      direction: EMBEDDED_WIDGET_DIRECTION.Previous,
      position: 'end',
    },
  });

export const deleteTitleSeparatorFromEditor = (view: EditorView): boolean => {
  if (!isCollapsedSelection(view)) return false;

  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  if (head !== line.from || line.number <= 1) return false;

  const previousLine = view.state.doc.line(line.number - 1);
  if (!TITLE_KEYWORD_LINE_PATTERN.test(previousLine.text)) return false;

  const focused = focusTitleBeforeLine(view, line.from, line.to);
  if (line.text.trim()) return focused;

  deleteEmptyLineAfterTitle(view, previousLine.to, line.from);
  return true;
};

export const keywordNavigationExtension: EditorExtension = () =>
  Prec.high(
    keymap.of([
      {
        key: 'ArrowDown',
        run: (view) => focusEmbeddedWidgetFromEditor(view, EMBEDDED_WIDGET_DIRECTION.Next),
      },
      {
        key: 'ArrowUp',
        run: (view) => focusEmbeddedWidgetFromEditor(view, EMBEDDED_WIDGET_DIRECTION.Previous),
      },
      {
        key: 'Backspace',
        run: deleteTitleSeparatorFromEditor,
      },
    ]),
  );
