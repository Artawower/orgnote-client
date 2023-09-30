import { OrgMultilineWidget } from './org-multiline-widget';
import { WidgetBuilder } from './widget.model';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

export interface AddWidgetEffect {
  orgNode: OrgNode;
  view: EditorView;
  widgetBuilder: WidgetBuilder;
}
export const addMultilineWidgetEffect = StateEffect.define<AddWidgetEffect>();
export const removeMultilineWidgetEffect = StateEffect.define<OrgNode>();

// TODO: REFACTOR. badly needs refactoring
export const orgMultilineWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(tables, tr) {
    for (const e of tr.effects) {
      if (e.is(addMultilineWidgetEffect)) {
        let alreadyDecoratedNode: Decoration;
        tables = tables.update({
          filter: (f, t, value) => {
            const found = value.spec.widget.eq({ orgNode: e.value.orgNode });
            if (found) {
              alreadyDecoratedNode = value;
            }
            return !found;
          },
        });

        tables = tables.update({
          add: [
            alreadyDecoratedNode
              ? alreadyDecoratedNode.range(
                  e.value.orgNode.start,
                  e.value.orgNode.end
                )
              : OrgMultilineWidget.init(
                  e.value.view,
                  e.value.orgNode,
                  e.value.widgetBuilder
                ),
          ],
        });
      }
      if (e.is(removeMultilineWidgetEffect)) {
        tables = tables.update({
          filter: (f, t, value) => !value.spec.widget.eq({ orgNode: e.value }),
        });
      }
    }
    return tables;
  },
  provide: (f) => {
    return EditorView.decorations.from(f);
  },
});
