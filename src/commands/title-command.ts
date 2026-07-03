import type { Command, OrgNoteApi } from 'orgnote-api';
import { EDITOR_COMMAND_GROUP } from 'orgnote-api';
import type { EditorView } from '@codemirror/view';
import { NodeType, type OrgNode } from 'org-mode-ast';
import {
  EMBEDDED_WIDGET_COMMAND,
  getEmbeddedWidgetBridge,
  type EmbeddedWidgetSnapshot,
} from 'src/utils/org-editor/embedded-widget-runtime';
import { debugEmbeddedWidgetNavigation } from 'src/utils/org-editor/embedded-widget-runtime/debug';
import {
  getPropertyWidgetRange,
  isRootPropertySequenceStart,
} from 'src/extensions/org-property-drawer/property-source';
import { titleWidgetId } from 'src/extensions/org-keyword-overlay/title-widget-id';
import { getKeywordName } from 'src/extensions/org-keyword-overlay/utils';

export const ADD_TITLE_COMMAND = 'editor.add-title';
const TITLE_TEMPLATE = '#+TITLE: ';
const TITLE_CURSOR_OFFSET = TITLE_TEMPLATE.length;
const DOCUMENT_START = 0;
const LEADING_NEWLINE_LENGTH = 1;

const rangeLineLabel = (view: EditorView, range: EmbeddedWidgetSnapshot['range']): string => {
  const docLength = view.state.doc.length;
  const from = Math.min(range.from, docLength);
  const to = Math.min(Math.max(range.to, from), docLength);
  const fromLine = view.state.doc.lineAt(from).number;
  const toLine = view.state.doc.lineAt(to).number;
  if (fromLine === toLine) return `L${fromLine}`;
  return `L${fromLine}-L${toLine}`;
};

const rangeBar = (view: EditorView, range: EmbeddedWidgetSnapshot['range']): string => {
  const width = 48;
  const docLength = Math.max(view.state.doc.length, 1);
  const start = Math.floor((Math.max(range.from, 0) / docLength) * width);
  const end = Math.max(start + 1, Math.ceil((Math.max(range.to, 0) / docLength) * width));
  return Array.from({ length: width }, (_, index) => {
    if (index < start) return '.';
    if (index < end) return '#';
    return '.';
  }).join('');
};

const widgetMap = (view: EditorView, widgets: readonly EmbeddedWidgetSnapshot[]): string => {
  if (!widgets.length) return '(empty widget registry)';
  return widgets
    .map((widget, index) => {
      const order = `${index + 1}`.padStart(2, '0');
      const range = `[${widget.range.from}-${widget.range.to}]`.padEnd(14, ' ');
      const lines = rangeLineLabel(view, widget.range).padEnd(7, ' ');
      const priority = `p=${widget.priority}`.padEnd(5, ' ');
      return `${order} ${widget.id.padEnd(24, ' ')} ${lines} ${range} ${priority} ${rangeBar(view, widget.range)}`;
    })
    .join('\n');
};

const debugAddTitleCommand = (
  view: EditorView,
  event: string,
  context: Record<string, unknown> = {},
): void => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const bridge = getEmbeddedWidgetBridge(view);
  const widgets = bridge.snapshot();
  debugEmbeddedWidgetNavigation(`add-title:${event}`, {
    head,
    lineNumber: line.number,
    lineFrom: line.from,
    lineTo: line.to,
    docLength: view.state.doc.length,
    docLines: view.state.doc.lines,
    registeredIds: widgets.map((widget) => widget.id),
    widgetMap: widgetMap(view, widgets),
    widgets,
    ...context,
  });
};

const getActiveEditorView = (api: OrgNoteApi): EditorView | undefined =>
  api.core.useEditor().activeContext?.editorViewGetter?.();

const titleKeyword = (root: OrgNode | null | undefined): OrgNode | undefined =>
  root?.childrenList.find((node) => getKeywordName(node) === 'title');

const rootPropertyDrawer = (root: OrgNode | null | undefined): OrgNode | undefined =>
  root?.childrenList.find(
    (node) =>
      node.is(NodeType.PropertyDrawer) ||
      (node.is(NodeType.Property) && isRootPropertySequenceStart(node)),
  );

const focusPosition = (view: EditorView, position: number): void => {
  view.dispatch({ selection: { anchor: position, head: position }, scrollIntoView: true });
  view.focus();
  debugAddTitleCommand(view, 'focus-position', { position });
};

const focusTitleWidget = (view: EditorView, nodeStart: number): void => {
  const id = titleWidgetId(nodeStart);
  const focused = getEmbeddedWidgetBridge(view).dispatch({
    type: EMBEDDED_WIDGET_COMMAND.Focus,
    payload: {
      id,
      position: 'end',
    },
  });
  debugAddTitleCommand(view, 'focus-existing-widget', { id, nodeStart, focused });
};

interface TitleInsertion {
  readonly from: number;
  readonly insert: string;
  readonly titleStart: number;
}

const titleInsertAtDocumentStart = (view: EditorView): TitleInsertion => ({
  from: DOCUMENT_START,
  insert: view.state.doc.length > 0 ? `${TITLE_TEMPLATE}\n` : TITLE_TEMPLATE,
  titleStart: DOCUMENT_START,
});

const lineAfterPosition = (view: EditorView, position: number): number => {
  const line = view.state.doc.lineAt(position);
  if (line.to >= view.state.doc.length) return line.to;
  return line.to + LEADING_NEWLINE_LENGTH;
};

const titleInsertAfterPropertyDrawer = (view: EditorView, propertyDrawer: OrgNode): TitleInsertion => {
  const range = getPropertyWidgetRange(propertyDrawer);
  const from = lineAfterPosition(view, range.to);
  if (from === range.to) {
    return { from, insert: `\n${TITLE_TEMPLATE}`, titleStart: from + LEADING_NEWLINE_LENGTH };
  }

  return { from, insert: `${TITLE_TEMPLATE}\n`, titleStart: from };
};

export const addTitleToEditor = (view: EditorView, root: OrgNode | null | undefined): void => {
  const existingTitle = titleKeyword(root);
  debugAddTitleCommand(view, 'start', {
    hasExistingTitle: Boolean(existingTitle),
    existingTitleRange: existingTitle ? { from: existingTitle.start, to: existingTitle.end } : undefined,
    rootChildCount: root?.childrenList.length,
  });

  if (existingTitle) {
    focusPosition(view, existingTitle.end);
    focusTitleWidget(view, existingTitle.start);
    return;
  }

  const propertyDrawer = rootPropertyDrawer(root);
  const insertion = propertyDrawer
    ? titleInsertAfterPropertyDrawer(view, propertyDrawer)
    : titleInsertAtDocumentStart(view);
  const titleCursorPosition = insertion.titleStart + TITLE_CURSOR_OFFSET;
  debugAddTitleCommand(view, 'insert-before-dispatch', {
    insertion,
    titleCursorPosition,
    hasRootPropertyDrawer: Boolean(propertyDrawer),
    propertyDrawerRange: propertyDrawer ? getPropertyWidgetRange(propertyDrawer) : undefined,
  });
  view.dispatch({
    changes: { from: insertion.from, to: insertion.from, insert: insertion.insert },
    selection: { anchor: titleCursorPosition, head: titleCursorPosition },
    scrollIntoView: true,
  });
  view.focus();
  debugAddTitleCommand(view, 'insert-after-dispatch', {
    insertion,
    titleCursorPosition,
    selectionHead: view.state.selection.main.head,
  });
};

export const createAddTitleCommand = (): Command => ({
  command: ADD_TITLE_COMMAND,
  title: 'Add title',
  icon: 'sym_o_title',
  group: EDITOR_COMMAND_GROUP,
  handler: (api) => {
    const editorStore = api.core.useEditor();
    const view = getActiveEditorView(api);
    if (!view) return;
    addTitleToEditor(view, editorStore.activeContext?.orgNode);
  },
});
