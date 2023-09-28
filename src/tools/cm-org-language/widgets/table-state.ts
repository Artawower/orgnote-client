import { TableWidget } from './table-widget';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

import { ComponentInternalInstance } from 'vue';

export interface AddWidgetEffect {
  orgNode: OrgNode;
  view: EditorView;
}
export const addTableEffect = StateEffect.define<AddWidgetEffect>();
export const removeTableEffect = StateEffect.define<OrgNode>();
export const removeAllTables = StateEffect.define<void>();

export const newTableField = (vueInstance: ComponentInternalInstance) =>
  StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },
    update(tables, tr) {
      for (const e of tr.effects) {
        if (e.is(addTableEffect)) {
          tables = tables.update({
            add: [TableWidget.init(e.value.view, e.value.orgNode, vueInstance)],
          });
        }
        if (e.is(removeTableEffect)) {
          tables = tables.update({
            filter: (f, t, value) =>
              !value.spec.widget.eq({ orgNode: e.value }),
          });
        }
        if (e.is(removeAllTables)) {
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
