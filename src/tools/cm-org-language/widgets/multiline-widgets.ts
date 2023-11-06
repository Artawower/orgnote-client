import {
  AddWidgetEffect,
  addMultilineWidgetEffect,
  removeMultilineWidgetEffect,
} from './org-multiline-widget-state';
import {
  EmbeddedWidget,
  EmbeddedWidgetBuilder,
  MultilineEmbeddedWidgets,
} from './widget.model';
import { StateEffect } from '@codemirror/state';
import { ViewUpdate } from '@codemirror/view';
import { ChangedRange } from '@lezer/common';
import { EditorView } from 'codemirror';
import { OrgNode, walkTree } from 'org-mode-ast';
import { hasIntersection } from 'src/tools/has-intersection';

export const orgMultilineWidgets = (
  getOrgNode: () => OrgNode,
  widgets: MultilineEmbeddedWidgets,
  readonly?: boolean,
  editBadgeWidget?: EmbeddedWidgetBuilder
) => {
  let previousCaretPosition: number;
  return EditorView.updateListener.of((v: ViewUpdate) => {
    const orgNode = getOrgNode();
    const currentCaretPosition = v.state.selection.main.head;
    const caretPositionChanged = currentCaretPosition !== previousCaretPosition;
    previousCaretPosition = currentCaretPosition;

    if (!v.docChanged && !v.viewportChanged && !caretPositionChanged) {
      return;
    }
    const effects: StateEffect<OrgNode | AddWidgetEffect>[] = [];

    walkTree(orgNode, (n: OrgNode) => {
      if (!widgets[n.type]) {
        return false;
      }

      const widgetRemoved = (
        v as unknown as { changedRanges: ChangedRange[] }
      ).changedRanges.find((r) =>
        hasIntersection(r.fromA, r.toA, n.start, n.end + 1)
      );
      const caretIntoWidget =
        currentCaretPosition >= n.start && currentCaretPosition <= n.end + 1;

      if (!readonly && (widgetRemoved || caretIntoWidget)) {
        effects.push(removeMultilineWidgetEffect.of(n));
        return;
      }

      const multilineEmbeddedWidget = widgets[n.type];
      if (
        multilineEmbeddedWidget.satisfied &&
        !multilineEmbeddedWidget.satisfied(n)
      ) {
        return;
      }
      effects.push(
        addMultilineWidgetEffect.of({
          orgNode: n,
          view: v.view,
          rootNodeSrc: getOrgNode,
          multilineWidget: multilineEmbeddedWidget,
          editBadgeWidget,
        })
      );
    });

    v.view.dispatch({ effects });
  });
};
