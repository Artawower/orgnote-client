import {
  AddWidgetEffect,
  addMultilineWidgetEffect,
  removeMultilineWidgetEffect,
} from './org-multiline-widget-state';
import { MultilineEmbeddedWidgets } from './widget.model';
import { StateEffect } from '@codemirror/state';
import { ViewUpdate } from '@codemirror/view';
import { EditorView } from 'codemirror';
import { OrgNode, walkTree } from 'org-mode-ast';

export const orgMultilineWidgets = (
  getOrgNode: () => OrgNode,
  widgets: MultilineEmbeddedWidgets,
  readonly?: boolean
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
      if (
        !readonly &&
        currentCaretPosition >= n.start &&
        currentCaretPosition <= n.end + 1
      ) {
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
          widgetBuilder: multilineEmbeddedWidget.widgetBuilder,
        })
      );
    });

    v.view.dispatch({ effects });
  });
};
