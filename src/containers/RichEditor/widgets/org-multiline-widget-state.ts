import { OrgMultilineWidget } from './org-multiline-widget';
import { StateEffect, StateField } from '@codemirror/state';
import type { DecorationSet } from '@codemirror/view';
import { Decoration, EditorView } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import type { MultilineEmbeddedWidget } from 'orgnote-api';
import { hasIntersection } from 'src/utils/has-intersection';

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
    filter: (from, to, value) => {
      const widget = value.spec.widget as OrgMultilineWidget | undefined;
      const isNotTargetWidget =
        !widget ||
        widget.orgNode.isNot(orgNode.type) ||
        !hasIntersection(from, to, orgNode.start, orgNode.end);

      return isNotTargetWidget;
    },
  });

const handleAddEffect = (widgets: DecorationSet, effect: AddWidgetEffect): DecorationSet => {
  const [startOffset, endOffset] = effect.multilineWidget.showRangeOffset ?? [0, 0];
  const start = effect.orgNode.start + startOffset;
  const end = effect.orgNode.end + endOffset;

  let existingWidget: OrgMultilineWidget | null = null;
  const withoutExisting = widgets.update({
    filter: (from, to, value) => {
      const widget = value.spec.widget as OrgMultilineWidget | undefined;
      const isNotTargetWidget =
        !widget ||
        widget.orgNode.isNot(effect.orgNode.type) ||
        !hasIntersection(from, to, start, end);

      if (isNotTargetWidget) return true;
      if (widget.isDestroyed() || !widget.sameNodeByOrgNode(effect.orgNode)) return false;

      existingWidget = widget;
      widget.updateOrgNode(effect.orgNode);
      return false;
    },
  });

  const decorationToAdd =
    existingWidget
      ? OrgMultilineWidget.createDecoration(existingWidget, effect.orgNode, effect.multilineWidget)
      : OrgMultilineWidget.init(effect.view, effect.orgNode, effect.rootNodeSrc, effect.multilineWidget);

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
