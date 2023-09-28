import {
  AddWidgetEffect,
  addTableEffect,
  removeAllTables,
  removeTableEffect,
} from './table-state';
import { StateEffect } from '@codemirror/state';
import { ViewUpdate } from '@codemirror/view';
import { EditorView } from 'codemirror';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

export const orgMultilineWidgets = (getOrgNode: () => OrgNode) => {
  let previousCaretPosition: number;
  return EditorView.updateListener.of((v: ViewUpdate) => {
    const orgNode = getOrgNode();
    const currentCaretPosition = v.state.selection.main.head;
    const caretPositionChanged = currentCaretPosition !== previousCaretPosition;
    previousCaretPosition = currentCaretPosition;

    if (v.docChanged) {
      v.view.dispatch({ effects: [removeAllTables.of()] });
    }

    if (!v.docChanged && !v.viewportChanged && !caretPositionChanged) {
      return;
    }
    const effects: StateEffect<OrgNode | AddWidgetEffect>[] = [];

    walkTree(orgNode, (n: OrgNode) => {
      if (n.isNot(NodeType.Table)) {
        return false;
      }
      if (
        currentCaretPosition >= n.start &&
        currentCaretPosition <= n.end + 1
      ) {
        effects.push(removeTableEffect.of(n));
        return;
      }
      effects.push(addTableEffect.of({ orgNode: n, view: v.view }));
    });

    v.view.dispatch({ effects });
  });
};
