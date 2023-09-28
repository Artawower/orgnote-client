import {
  AddWidgetEffect,
  addMultilineWidgetEffect,
  removeAllMultilineWidgetsEffect,
  removeMultilineWidgetEffect,
} from './org-multiline-widget-state';
import { StateEffect } from '@codemirror/state';
import { ViewUpdate } from '@codemirror/view';
import { EditorView } from 'codemirror';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

export type EmbeddedOrgWidget = {
  destroy: () => void;
};

export type WidgetBuilder = (
  wrap: HTMLElement,
  orgNode: OrgNode
) => EmbeddedOrgWidget;
export type EmbeddedWidgets = {
  [key in NodeType]?: WidgetBuilder;
};

export const orgMultilineWidgets = (
  getOrgNode: () => OrgNode,
  widgets: EmbeddedWidgets
) => {
  let previousCaretPosition: number;
  return EditorView.updateListener.of((v: ViewUpdate) => {
    const orgNode = getOrgNode();
    const currentCaretPosition = v.state.selection.main.head;
    const caretPositionChanged = currentCaretPosition !== previousCaretPosition;
    previousCaretPosition = currentCaretPosition;

    if (v.docChanged) {
      v.view.dispatch({ effects: [removeAllMultilineWidgetsEffect.of()] });
    }

    if (!v.docChanged && !v.viewportChanged && !caretPositionChanged) {
      return;
    }
    const effects: StateEffect<OrgNode | AddWidgetEffect>[] = [];

    walkTree(orgNode, (n: OrgNode) => {
      if (!widgets[n.type]) {
        return false;
      }
      if (
        currentCaretPosition >= n.start &&
        currentCaretPosition <= n.end + 1
      ) {
        effects.push(removeMultilineWidgetEffect.of(n));
        return;
      }
      effects.push(
        addMultilineWidgetEffect.of({
          orgNode: n,
          view: v.view,
          widgetBuilder: widgets[n.type],
        })
      );
    });

    v.view.dispatch({ effects });
  });
};
