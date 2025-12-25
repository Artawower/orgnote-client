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

const hasWidgetAt = (
  widgets: DecorationSet,
  start: number,
  end: number,
  nodeType: string,
): boolean => {
  let exists = false;
  widgets.between(start, end, (from, to, value) => {
    const widget = value.spec.widget as OrgMultilineWidget | undefined;
    if (widget?.orgNode.type === nodeType && from === start && to === end) {
      exists = true;
    }
  });
  return exists;
};

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

  if (hasWidgetAt(widgets, start, end, nodeType)) {
    return widgets;
  }

  return widgets.update({
    add: [OrgMultilineWidget.init(effect.view, effect.orgNode, effect.rootNodeSrc, effect.multilineWidget)],
  });
};

export const orgMultilineWidgetField = StateField.define<DecorationSet>({
  create: () => Decoration.none,

  update: (widgets, tr) =>
    tr.effects.reduce((acc, e) => {
      if (e.is(addMultilineWidgetEffect)) return handleAddEffect(acc, e.value);
      if (e.is(removeMultilineWidgetEffect)) return removeByNode(acc, e.value);
      return acc;
    }, widgets.map(tr.changes)),

  provide: (f) => EditorView.decorations.from(f),
});
