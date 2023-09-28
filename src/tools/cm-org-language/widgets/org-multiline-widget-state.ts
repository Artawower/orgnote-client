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
export const removeAllMultilineWidgetsEffect = StateEffect.define<void>();

export const orgMultilineWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(tables, tr) {
    for (const e of tr.effects) {
      if (e.is(addMultilineWidgetEffect)) {
        tables = tables.update({
          add: [
            OrgMultilineWidget.init(
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
      if (e.is(removeAllMultilineWidgetsEffect)) {
        tables = tables.update({
          filter: () => false,
        });
      }
    }
    return tables;
  },
  provide: (f) => {
    return EditorView.decorations.from(f);
  },
});
