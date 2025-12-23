import { defineStore } from 'pinia';
import { computed, shallowRef, type Component } from 'vue';
import type {
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  OrgLineClasses,
  WidgetBuilder,
  EmbeddedWidgetBuilder,
  WidgetBuilderParams,
  EmbeddedWidget,
  EditorExtension,
  WidgetMeta,
  EditorStore,
} from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import type { NodeType } from 'org-mode-ast';
import { useDynamicComponent } from 'src/utils/dynamic-component';

const textToKebab = (text: string): string =>
  text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

interface WidgetRegistry {
  [WidgetType.Inline]: InlineEmbeddedWidgets;
  [WidgetType.Multiline]: MultilineEmbeddedWidgets;
  [WidgetType.LineClass]: OrgLineClasses;
}

export const useEditorStore = defineStore<'editor', EditorStore>('editor', () => {
  const widgetRegistry = shallowRef<WidgetRegistry>({
    [WidgetType.Inline]: {},
    [WidgetType.Multiline]: {},
    [WidgetType.LineClass]: {},
  });

  const extensions = shallowRef<EditorExtension[]>([]);

  let dynamicComponentInstance: ReturnType<typeof useDynamicComponent> | null = null;

  const getDynamicComponent = () => {
    dynamicComponentInstance ??= useDynamicComponent();
    return dynamicComponentInstance;
  };

  const addWidget = (meta: WidgetMeta): void => {
    const { type, nodeType, ...widget } = meta;
    const registry = widgetRegistry.value[type];
    (registry as Record<string, unknown>)[nodeType] = widget;
  };

  const addWidgets = (...widgets: WidgetMeta[]): void => {
    widgets.forEach(addWidget);
    widgetRegistry.value = { ...widgetRegistry.value };
  };

  const removeWidget = (nodeType: NodeType): void => {
    delete widgetRegistry.value[WidgetType.Inline][nodeType];
    delete widgetRegistry.value[WidgetType.Multiline][nodeType];
    delete widgetRegistry.value[WidgetType.LineClass][nodeType];
    widgetRegistry.value = { ...widgetRegistry.value };
  };

  const addExtensions = (...newExtensions: EditorExtension[]): void => {
    extensions.value = [...extensions.value, ...newExtensions];
  };

  const removeExtensions = (...toRemove: EditorExtension[]): void => {
    extensions.value = extensions.value.filter((ext) => !toRemove.includes(ext));
  };

  const createWidgetBuilder = (
    cmp: Component,
    props: Record<string, unknown> = {}
  ): WidgetBuilder => {
    return (params: WidgetBuilderParams): EmbeddedWidget => {
      const normalizedType = textToKebab(params.orgNode.type.toLowerCase());
      params.wrap.classList.add(`org-embedded-${normalizedType}`);

      return getDynamicComponent().mount(cmp, params.wrap, {
        ...props,
        node: params.orgNode,
        editorView: params.editorView,
        rootNodeSrc: params.rootNodeSrc,
        readonly: params.readonly,
        onUpdate: (newVal: string) => params.onUpdateFn?.(newVal),
      });
    };
  };

  const createEmbeddedWidgetBuilder = (
    cmp: Component,
    props: Record<string, unknown> = {}
  ): EmbeddedWidgetBuilder => {
    return (wrap: HTMLElement, dynamicProps: Record<string, unknown> = {}) =>
      getDynamicComponent().mount(cmp, wrap, { ...props, ...dynamicProps });
  };

  const inlineWidgets = computed(() => widgetRegistry.value[WidgetType.Inline]);
  const multilineWidgets = computed(() => widgetRegistry.value[WidgetType.Multiline]);
  const lineClasses = computed(() => widgetRegistry.value[WidgetType.LineClass]);

  return {
    inlineWidgets,
    multilineWidgets,
    lineClasses,
    extensions,
    addWidgets,
    removeWidget,
    addExtensions,
    removeExtensions,
    createWidgetBuilder,
    createEmbeddedWidgetBuilder,
  };
});
