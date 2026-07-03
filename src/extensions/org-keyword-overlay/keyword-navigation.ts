import type { EditorExtension } from 'orgnote-api';
import { Prec } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import {
  EMBEDDED_WIDGET_COMMAND,
  EMBEDDED_WIDGET_DIRECTION,
  getEmbeddedWidgetBridge,
} from 'src/utils/org-editor/embedded-widget-runtime';
import { debugEmbeddedWidgetNavigation } from 'src/utils/org-editor/embedded-widget-runtime/debug';

const TITLE_KEYWORD_LINE_PATTERN = /^#\+TITLE:/i;

const EDITOR_TITLE_DELETE_SOURCE_ID = 'editor-title-delete';

const isCollapsedSelection = (view: EditorView): boolean => view.state.selection.main.empty;

const debugEditorNavigation = (
  view: EditorView,
  event: string,
  context: Record<string, unknown> = {},
): void => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  debugEmbeddedWidgetNavigation(event, {
    head,
    lineNumber: line.number,
    lineFrom: line.from,
    lineTo: line.to,
    docLines: view.state.doc.lines,
    ...context,
  });
};

const editorTargetLineNumber = (view: EditorView, direction: -1 | 1): number | undefined => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const lineNumber = direction > 0 && head < line.to ? line.number : line.number + direction;
  if (lineNumber < 1 || lineNumber > view.state.doc.lines) return undefined;
  return lineNumber;
};

const focusTitleLineFallback = (view: EditorView, direction: -1 | 1): boolean => {
  const lineNumber = editorTargetLineNumber(view, direction);
  if (lineNumber === undefined) {
    debugEditorNavigation(view, 'title-fallback:no-target-line', { direction });
    return false;
  }

  const line = view.state.doc.line(lineNumber);
  const isTitleLine = TITLE_KEYWORD_LINE_PATTERN.test(line.text);
  if (!isTitleLine) {
    debugEditorNavigation(view, 'title-fallback:not-title-line', { direction, lineNumber });
    return false;
  }

  const anchor = direction > 0 ? line.from : line.to;
  view.dispatch({ selection: { anchor }, scrollIntoView: true });
  view.focus();
  debugEditorNavigation(view, 'title-fallback:focused-editor-line', {
    direction,
    lineNumber,
    anchor,
  });
  return true;
};

export const focusEmbeddedWidgetFromEditor = (
  view: EditorView,
  direction: -1 | 1,
): boolean => {
  if (!isCollapsedSelection(view)) {
    debugEditorNavigation(view, 'editor-arrow:selection-not-collapsed', { direction });
    return false;
  }

  const bridge = getEmbeddedWidgetBridge(view);
  const focused = bridge.dispatch({
    type: EMBEDDED_WIDGET_COMMAND.FocusFromEditor,
    payload: {
      direction,
      position: direction > 0 ? 'start' : 'end',
    },
  });
  const fallbackFocused = focused ? false : focusTitleLineFallback(view, direction);
  debugEditorNavigation(view, 'editor-arrow:result', {
    direction,
    bridgeFocused: focused,
    fallbackFocused,
  });
  return focused || fallbackFocused;
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
  debugEditorNavigation(view, 'title-separator-backspace', {
    focused,
    currentLine: line.number,
    previousLine: previousLine.number,
    currentLineEmpty: !line.text.trim(),
  });
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
