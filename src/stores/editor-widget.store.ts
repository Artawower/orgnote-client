import {
  type OrgNoteApi,
  type WidgetMeta,
  WidgetType,
  type MultilineEmbeddedWidgets,
  type InlineEmbeddedWidgets,
  WidgetBuilderParams,
  EmbeddedWidget,
  WidgetBuilder,
} from 'orgnote-api';
import { defineStore } from 'pinia';
import { useDynamicComponent } from 'src/hooks';
import { textToKebab } from 'src/tools';
import { computed } from 'vue';
import { shallowRef, Component } from 'vue';

interface WidgetRegistry {
  [WidgetType.Multiline]: MultilineEmbeddedWidgets;
  [WidgetType.LineClass]: Record<string, unknown>; // TODO: FIX
  [WidgetType.Inline]: InlineEmbeddedWidgets;
}

export const useEditorWidgetStore = defineStore('editor-widget', () => {
  const widgetRegistry = shallowRef<WidgetRegistry>({
    [WidgetType.Inline]: {},
    [WidgetType.LineClass]: {},
    [WidgetType.Multiline]: {},
  });

  const add: OrgNoteApi['editor']['widgets']['add'] = (
    ...widgetMeta: WidgetMeta[]
  ) => {
    widgetMeta.forEach((meta) => {
      addWidget(meta);
    });
  };

  const addWidget = (meta: WidgetMeta) => {
    const { type, nodeType, ...embeddedWidget } = meta;

    widgetRegistry.value[type][nodeType] =
      embeddedWidget as WidgetRegistry[typeof type];
  };

  const dynamicComponent = useDynamicComponent();
  const createWidgetBuilder: OrgNoteApi['editor']['widgets']['createWidgetBuilder'] =
    (cmp: Component, props: { [key: string]: unknown } = {}): WidgetBuilder => {
      return ({
        wrap,
        rootNodeSrc,
        onUpdateFn,
        orgNode,
        editorView,
        readonly,
      }: WidgetBuilderParams): EmbeddedWidget => {
        const normalizedOrgNodeType = textToKebab(orgNode.type.toLowerCase());
        wrap.classList.add(`org-embedded-${normalizedOrgNodeType}`);
        return dynamicComponent.mount(cmp, wrap, {
          ...props,
          node: orgNode,
          editorView,
          rootNodeSrc,
          readonly,
          onUpdate: (newVal: string) => {
            onUpdateFn?.(newVal);
          },
        });
      };
    };

  const multilineExtensions = computed(() => widgetRegistry.value.multiline);

  const inlineExtensions = computed(() => widgetRegistry.value.inline);

  return {
    widgetRegistry,
    dynamicComponent,
    createWidgetBuilder,
    multilineExtensions,
    inlineExtensions,
    add,
  };
});
