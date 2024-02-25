import {
  EmbeddedWidgetBuilder,
  InlineEmbeddedWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
} from 'src/api';

import { Component } from 'vue';

import OrgHeadlineOperator from 'src/components/OrgHeadlineOperator.vue';
import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { useEditorStore } from 'src/stores/editor.store';
import { OrgLineClasses } from 'orgnote-api';

export const useEmbeddedWidgets = () => {
  const {
    createWidgetBuilder,
    dynamicComponent,
    multilineExtensions,
    inlineExtensions,
    lineClassesExtensions,
  } = useEditorStore();

  const multilineEmbeddedWidgets: MultilineEmbeddedWidgets =
    multilineExtensions;

  const inlineEmbeddedWidgets: InlineEmbeddedWidgets = inlineExtensions;

  const lineClasses: OrgLineClasses = lineClassesExtensions;

  const createEmbeddedWidget =
    (cmp: Component, props = {}): EmbeddedWidgetBuilder =>
    (wrap: HTMLElement, dynamicProps: { [key: string]: unknown } = {}) =>
      dynamicComponent.mount(cmp, wrap, {
        ...props,
        ...dynamicProps,
      });

  const editBadgeWidget = createEmbeddedWidget(ActionBtn, {
    icon: 'edit_note',
    activeIcon: 'done',
  });

  const foldWidget: InlineEmbeddedWidget = {
    decorationType: 'replace',
    ignoreEvent: true,
    widgetBuilder: createWidgetBuilder(OrgHeadlineOperator),
  };

  return {
    createWidgetBuilder,
    multilineEmbeddedWidgets,
    inlineEmbeddedWidgets,
    lineClasses,
    foldWidget,
    editBadgeWidget,
  };
};
