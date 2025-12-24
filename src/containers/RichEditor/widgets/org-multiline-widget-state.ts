import { OrgMultilineWidget } from './org-multiline-widget';
import { StateEffect, StateField } from '@codemirror/state';
import type { DecorationSet } from '@codemirror/view';
import { Decoration, EditorView } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import type { MultilineEmbeddedWidget } from 'orgnote-api';

export interface AddWidgetEffect {
  orgNode: OrgNode;
  view: EditorView;
  multilineWidget: MultilineEmbeddedWidget;
  rootNodeSrc: () => OrgNode | null;
}

export const addMultilineWidgetEffect = StateEffect.define<AddWidgetEffect>();
export const removeMultilineWidgetEffect = StateEffect.define<OrgNode>();

export const orgMultilineWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(multilineWidgets, tr) {
    for (const e of tr.effects) {
      if (e.is(addMultilineWidgetEffect)) {
        let alreadyDecoratedNode: Decoration | undefined;

        multilineWidgets = multilineWidgets.update({
          filter: (_f, _t, value) => {
            const widget = value.spec.widget as OrgMultilineWidget | undefined;
            if (!widget) {
              return true;
            }
            const found = widget.eqByNode(e.value.orgNode);
            if (found) {
              alreadyDecoratedNode = value;
            }
            return !found;
          },
        });

        multilineWidgets = multilineWidgets.update({
          add: [
            alreadyDecoratedNode
              ? alreadyDecoratedNode.range(
                  e.value.orgNode.start,
                  e.value.orgNode.end
                )
              : OrgMultilineWidget.init(
                  e.value.view,
                  e.value.orgNode,
                  e.value.rootNodeSrc,
                  e.value.multilineWidget,
                ),
          ],
        });
      }

      if (e.is(removeMultilineWidgetEffect)) {
        multilineWidgets = multilineWidgets.update({
          filter: (_f, _t, value) => {
            const widget = value.spec.widget as OrgMultilineWidget | undefined;
            if (!widget) {
              return true;
            }
            return !widget.sameNodeByOrgNode(e.value);
          },
        });
      }
    }
    return multilineWidgets;
  },

  provide: (f) => EditorView.decorations.from(f),
});
