import { OrgInlineWidget } from './org-inline-widget';
import type { Range } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import { walkTree } from 'org-mode-ast';
import type { InlineEmbeddedWidgets } from 'orgnote-api';
import {
  orgNodeGetterFacet,
  readonlyFacet,
  inlineWidgetsFacet,
  type OrgNodeGetter,
} from '../facets';
import { findHighestPriorityWidget } from '../utils';

const buildDecorations = (
  view: EditorView,
  inlineWidgets: InlineEmbeddedWidgets,
  readonly: boolean,
  getRootNode: OrgNodeGetter
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

    const [startOffset, endOffset] = inlineWidget.showRangeOffset ?? [0, 0];

    if (
      view.hasFocus &&
      !inlineWidget.ignoreEditing &&
      caretPosition >= n.start - startOffset &&
      caretPosition <= n.end + endOffset
    ) {
      return false;
    }

    const decoration = OrgInlineWidget.init(
      view,
      n,
      inlineWidget,
      getRootNode,
      readonly
    );

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

      return buildDecorations(view, inlineWidgets, readonly, getRootNode);
    }

    public update(update: ViewUpdate): void {
      const caretPosition = update.state.selection.main.head;
      const caretPositionChanged = this.lastPosition !== caretPosition;
      this.lastPosition = caretPosition;

      if (
        update.docChanged ||
        update.viewportChanged ||
        update.focusChanged ||
        caretPositionChanged
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
  }
);
