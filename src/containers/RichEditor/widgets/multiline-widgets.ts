import { OrgMultilineWidget } from './org-multiline-widget';
import type { Transaction } from '@codemirror/state';
import { StateField, type EditorState } from '@codemirror/state';
import type { DecorationSet } from '@codemirror/view';
import { Decoration, EditorView } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import { walkTree } from 'org-mode-ast';
import { hasIntersection } from 'src/utils/has-intersection';
import { orgNodeGetterFacet, readonlyFacet, multilineWidgetsFacet } from '../facets';
import { findHighestPriorityWidget } from '../utils';

const removeWidgetByNode = (widgets: DecorationSet, orgNode: OrgNode): DecorationSet =>
  widgets.update({
    filter: (from, to, value) => {
      const widget = value.spec.widget as OrgMultilineWidget | undefined;
      return (
        !widget ||
        widget.orgNode.isNot(orgNode.type) ||
        !hasIntersection(from, to, orgNode.start, orgNode.end)
      );
    },
  });

const addOrUpdateWidget = (
  widgets: DecorationSet,
  state: EditorState,
  orgNode: OrgNode,
  rootNodeSrc: () => OrgNode | null,
  multilineWidget: Parameters<typeof OrgMultilineWidget.init>[3],
  editorViewRef: { current: EditorView | null },
): DecorationSet => {
  const [startOffset, endOffset] = multilineWidget.showRangeOffset ?? [0, 0];
  const start = orgNode.start + startOffset;
  const end = orgNode.end + endOffset;

  let existingWidget: OrgMultilineWidget | null = null;

  const withoutExisting = widgets.update({
    filter: (from, to, value) => {
      const widget = value.spec.widget as OrgMultilineWidget | undefined;
      const isNotTargetWidget =
        !widget || widget.orgNode.isNot(orgNode.type) || !hasIntersection(from, to, start, end);

      if (isNotTargetWidget) return true;
      if (widget.isDestroyed() || !widget.sameNodeByOrgNode(orgNode)) return false;

      existingWidget = widget;
      widget.updateOrgNode(orgNode);
      return false;
    },
  });

  if (!editorViewRef.current) return withoutExisting;

  const decorationToAdd = existingWidget
    ? OrgMultilineWidget.createDecoration(existingWidget, orgNode, multilineWidget)
    : OrgMultilineWidget.init(editorViewRef.current, orgNode, rootNodeSrc, multilineWidget);

  return withoutExisting.update({
    add: [decorationToAdd],
  });
};

const isOrgNodeSynced = (state: EditorState, orgNode: OrgNode | null): boolean => {
  if (!orgNode) return false;
  return orgNode.rawValue === state.doc.toString();
};

const buildDecorations = (
  state: EditorState,
  current: DecorationSet,
  editorViewRef: { current: EditorView | null },
): DecorationSet => {
  const getOrgNode = state.facet(orgNodeGetterFacet);
  const readonly = state.facet(readonlyFacet);
  const widgets = state.facet(multilineWidgetsFacet);
  const orgNode = getOrgNode();

  if (!orgNode || !isOrgNodeSynced(state, orgNode)) return current;

  const currentCaretPosition = state.selection.main.head;
  let result = current;

  walkTree(orgNode, (n: OrgNode): boolean => {
    const widgetList = widgets[n.type];
    const multilineEmbeddedWidget = findHighestPriorityWidget(widgetList, n);

    if (!multilineEmbeddedWidget) return false;

    const caretIntoWidget = currentCaretPosition >= n.start && currentCaretPosition <= n.end + 1;
    const shouldRemove =
      !readonly && !multilineEmbeddedWidget.suppressEdit && caretIntoWidget;

    if (shouldRemove) {
      result = removeWidgetByNode(result, n);
      return false;
    }

    result = addOrUpdateWidget(result, state, n, getOrgNode, multilineEmbeddedWidget, editorViewRef);
    return false;
  });

  return result;
};

const hasSignificantChanges = (tr: Transaction): boolean => {
  if (tr.docChanged) return true;
  if (tr.selection === tr.startState.selection) return false;

  const current = tr.state.selection.main;
  const previous = tr.startState.selection.main;

  if (!current.empty) return previous.empty;
  return true;
};

export const createMultilineWidgetsField = (
  editorViewRef: { current: EditorView | null },
): StateField<DecorationSet> =>
  StateField.define<DecorationSet>({
    create: (state) => buildDecorations(state, Decoration.none, editorViewRef),

    update: (decorations, tr) => {
      if (!hasSignificantChanges(tr)) return decorations;

      const mapped = tr.docChanged ? Decoration.none : decorations.map(tr.changes);
      return buildDecorations(tr.state, mapped, editorViewRef);
    },

    provide: (field) => EditorView.decorations.from(field),
  });
