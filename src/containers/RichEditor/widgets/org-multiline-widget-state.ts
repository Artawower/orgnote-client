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

const removeByNode = (widgets: DecorationSet, orgNode: OrgNode): DecorationSet =>
  widgets.update({
    filter: (_f, _t, value) => {
      const widget = value.spec.widget as OrgMultilineWidget | undefined;
      return !widget?.sameNodeByOrgNode(orgNode);
    },
  });

const handleAddEffect = (widgets: DecorationSet, effect: AddWidgetEffect): DecorationSet => {
  const [startOffset, endOffset] = effect.multilineWidget.showRangeOffset ?? [0, 0];
  const start = effect.orgNode.start + startOffset;
  const end = effect.orgNode.end + endOffset;
  const { type: nodeType } = effect.orgNode;

  let existingDecoration: Decoration | null = null;
  let canReuse = false;
  const withoutExisting = widgets.update({
    filter: (_f, _t, value) => {
      const widget = value.spec.widget as OrgMultilineWidget | undefined;
      if (!widget) return true;
      if (!widget.sameNodeByOrgNode(effect.orgNode)) return true;
      if (widget.isDestroyed()) return false;
      existingDecoration = value;
      canReuse = true;
      widget.updateOrgNode(effect.orgNode);
      return false;
    },
  });

  const decorationToAdd =
    (canReuse ? existingDecoration?.range(start, end) : null) ??
    OrgMultilineWidget.init(effect.view, effect.orgNode, effect.rootNodeSrc, effect.multilineWidget);

  return withoutExisting.update({
    add: [decorationToAdd],
  });
};

export const orgMultilineWidgetField = StateField.define<DecorationSet>({
  create: () => Decoration.none,

  update: (widgets, tr) => {
    const mapped = widgets.map(tr.changes);

    const result = tr.effects.reduce((acc, e) => {
      if (e.is(addMultilineWidgetEffect)) return handleAddEffect(acc, e.value);
      if (e.is(removeMultilineWidgetEffect)) return removeByNode(acc, e.value);
      return acc;
    }, mapped);

    return result;
  },

  provide: (f) => EditorView.decorations.from(f),
});
