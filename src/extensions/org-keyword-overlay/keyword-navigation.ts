import type { EditorExtension } from 'orgnote-api';
import { Prec } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';
import {
  EMBEDDED_WIDGET_COMMAND,
  EMBEDDED_WIDGET_DIRECTION,
  getEmbeddedWidgetBridge,
} from 'src/utils/org-editor/embedded-widget-runtime';

const isCollapsedSelection = (view: EditorView): boolean => view.state.selection.main.empty;

const focusEmbeddedWidgetFromEditor = (
  view: EditorView,
  direction: -1 | 1,
): boolean => {
  if (!isCollapsedSelection(view)) return false;

  const bridge = getEmbeddedWidgetBridge(view);
  return bridge.dispatch({
    type: EMBEDDED_WIDGET_COMMAND.FocusFromEditor,
    payload: {
      direction,
      position: direction > 0 ? 'start' : 'end',
    },
  });
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
    ]),
  );
