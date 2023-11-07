import { OrgInlineWidget } from './org-inline-widget';
import { InlineEmbeddedWidget } from './widget.model';
import { foldEffect, unfoldEffect } from '@codemirror/language';
import { Range, StateEffect, StateField } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewUpdate,
} from '@codemirror/view';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

const getFoldingWidgets = (
  getOrgNodeTree: () => OrgNode,
  getEditorView: () => EditorView,
  foldWidget: InlineEmbeddedWidget,
  caretPosition: number
): Range<Decoration>[] => {
  const orgNode = getOrgNodeTree();
  const editorView = getEditorView();
  const rangeSet: Range<Decoration>[] = [];
  walkTree(orgNode, (n: OrgNode) => {
    if (
      editorView.hasFocus &&
      caretPosition >= n.start &&
      caretPosition <= n.end
    ) {
      return;
    }
    if (n.is(NodeType.Operator) && n.parent?.parent?.is(NodeType.Headline)) {
      rangeSet.push(
        OrgInlineWidget.init(editorView, n, foldWidget, getOrgNodeTree, false)
      );
    }
    return false;
  });
  return rangeSet;
};

export const addFoldingWidgetEffect = StateEffect.define<Range<Decoration>>();
export const removeFoldingWidgetEffect = StateEffect.define<void>();

export const orgFoldingField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(foldingWidgets, tr) {
    for (const e of tr.effects) {
      if (e.is(removeFoldingWidgetEffect)) {
        foldingWidgets = foldingWidgets.update({
          filter: () => false,
        });
        break;
      }
      if (!e.is(addFoldingWidgetEffect)) {
        continue;
      }
      foldingWidgets = foldingWidgets.update({
        add: [e.value],
      });
    }
    return foldingWidgets;
  },
  provide: (f) => {
    return EditorView.decorations.from(f);
  },
});

const foldingListener = (
  getOrgNodeTree: () => OrgNode,
  getEditorView: () => EditorView,
  foldWidget: InlineEmbeddedWidget
) => {
  let inited = false;
  let lastCaretPosition: number;
  return EditorView.updateListener.of((update: ViewUpdate) => {
    const updateFolding = update.transactions.find((tr) =>
      tr.effects.find((e) => e.is(foldEffect) || e.is(unfoldEffect))
    );

    const caretPosition = update.state.selection.main.head;
    const caretPositionChanged = lastCaretPosition !== caretPosition;
    lastCaretPosition = caretPosition;
    if (
      inited &&
      !updateFolding &&
      !update.docChanged &&
      !update.viewportChanged &&
      !caretPositionChanged &&
      !update.focusChanged
    ) {
      return;
    }

    inited = true;

    update.view.dispatch({ effects: [removeFoldingWidgetEffect.of()] });

    const decorations = getFoldingWidgets(
      getOrgNodeTree,
      getEditorView,
      foldWidget,
      caretPosition
    );

    const effects: StateEffect<Range<Decoration>>[] = decorations.map((d) =>
      addFoldingWidgetEffect.of(d)
    );
    update.view.dispatch({
      effects,
    });
  });
};

export function orgFolding(
  getOrgNodeTree: () => OrgNode,
  getEditorView: () => EditorView,
  foldWidget: InlineEmbeddedWidget
) {
  return [
    foldingListener(getOrgNodeTree, getEditorView, foldWidget),
    orgFoldingField,
  ];
}
