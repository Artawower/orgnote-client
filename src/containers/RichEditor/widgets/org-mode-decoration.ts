import { OrgInlineWidget } from './org-inline-widget';
import type { Range } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import { walkTree } from 'org-mode-ast';
import type { InlineEmbeddedWidgets, MultilineEmbeddedWidgets } from 'orgnote-api';
import {
  orgNodeGetterFacet,
  readonlyFacet,
  inlineWidgetsFacet,
  multilineWidgetsFacet,
  type OrgNodeGetter,
} from '../facets';
import { findHighestPriorityWidget } from '../utils';

const isNodeOnActiveLine = (view: EditorView, node: OrgNode, caretPosition: number): boolean => {
  const activeLine = view.state.doc.lineAt(caretPosition);
  const clampedStart = Math.min(node.start, view.state.doc.length);
  const nodeLine = view.state.doc.lineAt(clampedStart);

  return activeLine.number === nodeLine.number;
};

const isInsideBlockWidget = (n: OrgNode, multilineWidgets: MultilineEmbeddedWidgets): boolean => {
  let parent = n.parent;
  while (parent) {
    const widgetList = multilineWidgets[parent.type];
    if (findHighestPriorityWidget(widgetList, parent)) return true;
    parent = parent.parent;
  }
  return false;
};

const buildDecorations = (
  view: EditorView,
  inlineWidgets: InlineEmbeddedWidgets,
  multilineWidgets: MultilineEmbeddedWidgets,
  readonly: boolean,
  getRootNode: OrgNodeGetter,
): DecorationSet => {
  const orgNode = getRootNode();
  if (!orgNode) return Decoration.none;

  const atomicDecorations: Range<Decoration>[] = [];
  const caretPosition = view.state.selection.main.head;

  const visibleRanges = view.visibleRanges;
  if (!visibleRanges.length) return Decoration.none;

  const firstRange = visibleRanges[0];
  const lastRange = visibleRanges[visibleRanges.length - 1];
  const visibleStart = firstRange?.from ?? 0;
  const visibleEnd = lastRange?.to ?? 0;

  walkTree(orgNode, (n: OrgNode): boolean => {
    if (n.start > visibleEnd) return true;
    if (n.start < visibleStart) return false;

    const widgetList = inlineWidgets[n.type];
    const inlineWidget = findHighestPriorityWidget(widgetList, n);
    if (!inlineWidget) return false;

    if (isInsideBlockWidget(n, multilineWidgets)) return false;

    const [startOffset, endOffset] = inlineWidget.showRangeOffset ?? [0, 0];

    if (
      !readonly &&
      view.hasFocus &&
      inlineWidget.hideOnActiveLine &&
      isNodeOnActiveLine(view, n, caretPosition)
    ) {
      return false;
    }

    if (
      !readonly &&
      view.hasFocus &&
      !inlineWidget.ignoreEditing &&
      caretPosition >= n.start - startOffset &&
      caretPosition <= n.end + endOffset
    ) {
      return false;
    }

    const decoration = OrgInlineWidget.init(view, n, inlineWidget, getRootNode, readonly);

    if (decoration) {
      atomicDecorations.push(decoration);
    }

    return false;
  });

  return Decoration.set(atomicDecorations);
};

export const orgInlineWidgets = ViewPlugin.fromClass(
  class {
    public decorations: DecorationSet = Decoration.none;
    private lastPosition = 0;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    private buildDecorations(view: EditorView): DecorationSet {
      const getRootNode = view.state.facet(orgNodeGetterFacet);
      const readonly = view.state.facet(readonlyFacet);
      const inlineWidgets = view.state.facet(inlineWidgetsFacet);
      const multilineWidgets = view.state.facet(multilineWidgetsFacet);

      return buildDecorations(view, inlineWidgets, multilineWidgets, readonly, getRootNode);
    }

    public update(update: ViewUpdate): void {
      const current = update.state.selection.main;
      const previous = update.startState.selection.main;
      const caretPositionChanged = this.lastPosition !== current.head;
      this.lastPosition = current.head;

      const selectionStarted = previous.empty && !current.empty;
      const selectionJustCollapsed = !previous.empty && current.empty;

      const readonly = update.state.facet(readonlyFacet);
      const shouldRebuildForCaret =
        !readonly && current.empty && (caretPositionChanged || selectionJustCollapsed);

      if (
        update.docChanged ||
        update.viewportChanged ||
        update.focusChanged ||
        shouldRebuildForCaret ||
        (!readonly && selectionStarted)
      ) {
        this.decorations = this.buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.decorations ?? Decoration.none;
      }),
  },
);
