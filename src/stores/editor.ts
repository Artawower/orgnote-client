import { defineStore } from 'pinia';
import { computed, h, shallowRef, type Component } from 'vue';
import type {
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  OrgLineClasses,
  WidgetBuilder,
  WidgetBuilderParams,
  EmbeddedWidget,
  EditorExtension,
  WidgetMeta,
  EditorStore,
} from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import type { NodeType } from 'org-mode-ast';
import { useDynamicComponent } from 'src/utils/dynamic-component';
import MultilineWidgetWrapper from 'src/containers/RichEditor/widgets/MultilineWidgetWrapper.vue';

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

  const addWidgets = (...widgets: WidgetMeta[]): void => {
    const newRegistry: WidgetRegistry = {
      [WidgetType.Inline]: { ...widgetRegistry.value[WidgetType.Inline] },
      [WidgetType.Multiline]: { ...widgetRegistry.value[WidgetType.Multiline] },
      [WidgetType.LineClass]: { ...widgetRegistry.value[WidgetType.LineClass] },
    };

    widgets.forEach(({ type, nodeType, ...widget }) => {
      (newRegistry[type] as Record<string, unknown>)[nodeType] = widget;
    });

    widgetRegistry.value = newRegistry;
  };

  const removeWidget = (nodeType: NodeType): void => {
    const newRegistry: WidgetRegistry = {
      [WidgetType.Inline]: { ...widgetRegistry.value[WidgetType.Inline] },
      [WidgetType.Multiline]: { ...widgetRegistry.value[WidgetType.Multiline] },
      [WidgetType.LineClass]: { ...widgetRegistry.value[WidgetType.LineClass] },
    };

    delete newRegistry[WidgetType.Inline][nodeType];
    delete newRegistry[WidgetType.Multiline][nodeType];
    delete newRegistry[WidgetType.LineClass][nodeType];

    widgetRegistry.value = newRegistry;
  };

  const addExtensions = (...newExtensions: EditorExtension[]): void => {
    extensions.value = [...extensions.value, ...newExtensions];
  };

  const removeExtensions = (...toRemove: EditorExtension[]): void => {
    extensions.value = extensions.value.filter((ext) => !toRemove.includes(ext));
  };

  const createWidgetBuilder = (
    cmp: Component,
    props: Record<string, unknown> = {},
  ): WidgetBuilder => {
    return (params: WidgetBuilderParams): EmbeddedWidget => {
      const normalizedType = textToKebab(params.orgNode.type);
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

  const createMultilineWidgetBuilder = (
    cmp: Component,
    props: Record<string, unknown> = {},
  ): WidgetBuilder => {
    return (params: WidgetBuilderParams): EmbeddedWidget => {
      const normalizedType = textToKebab(params.orgNode.type);
      params.wrap.classList.add(`org-embedded-${normalizedType}`);

      const wrappedComponent = h(
        MultilineWidgetWrapper,
        {
          readonly: params.readonly,
          suppressEdit: params.suppressEdit,
          onEdit: () => params.onEditMode?.(),
        },
        () =>
          h(cmp, {
            ...props,
            node: params.orgNode,
            editorView: params.editorView,
            rootNodeSrc: params.rootNodeSrc,
            readonly: params.readonly,
            onUpdate: (newVal: string) => params.onUpdateFn?.(newVal),
          }),
      );

      return getDynamicComponent().mount(wrappedComponent, params.wrap);
    };
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
    createMultilineWidgetBuilder,
  };
});
