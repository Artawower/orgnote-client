import {
  type AddWidgetEffect,
  addMultilineWidgetEffect,
  removeMultilineWidgetEffect,
} from './org-multiline-widget-state';
import type { StateEffect } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import type { ChangedRange } from '@lezer/common';
import type { OrgNode } from 'org-mode-ast';
import { walkTree } from 'org-mode-ast';
import { hasIntersection } from 'src/utils/has-intersection';
import { orgNodeGetterFacet, readonlyFacet, multilineWidgetsFacet } from '../facets';

let previousCaretPosition: number;

export const orgMultilineWidgets = EditorView.updateListener.of((v: ViewUpdate) => {
  const getOrgNode = v.state.facet(orgNodeGetterFacet);
  const readonly = v.state.facet(readonlyFacet);
  const widgets = v.state.facet(multilineWidgetsFacet);

  const orgNode = getOrgNode();
  if (!orgNode) return;

  const currentCaretPosition = v.state.selection.main.head;
  const caretPositionChanged = currentCaretPosition !== previousCaretPosition;
  previousCaretPosition = currentCaretPosition;

  if (!v.docChanged && !v.viewportChanged && !caretPositionChanged) {
    return;
  }

  const effects: StateEffect<OrgNode | AddWidgetEffect>[] = [];

  walkTree(orgNode, (n: OrgNode): boolean => {
    const multilineEmbeddedWidget = widgets[n.type];
    if (!multilineEmbeddedWidget) {
      return false;
    }

    const changedRanges = (v as unknown as { changedRanges: ChangedRange[] })
      .changedRanges;
    const widgetRemoved = changedRanges.find((r) =>
      hasIntersection(r.fromA, r.toA, n.start, n.end + 1)
    );
    const caretIntoWidget =
      currentCaretPosition >= n.start && currentCaretPosition <= n.end + 1;

    if (!readonly && (widgetRemoved || caretIntoWidget)) {
      effects.push(removeMultilineWidgetEffect.of(n));
      return false;
    }

    if (
      !multilineEmbeddedWidget.suppressEdit &&
      multilineEmbeddedWidget.satisfied &&
      !multilineEmbeddedWidget.satisfied(n)
    ) {
      return false;
    }

    effects.push(
      addMultilineWidgetEffect.of({
        orgNode: n,
        view: v.view,
        rootNodeSrc: getOrgNode,
        multilineWidget: multilineEmbeddedWidget,
      })
    );

    return false;
  });

  v.view.dispatch({ effects });
});
