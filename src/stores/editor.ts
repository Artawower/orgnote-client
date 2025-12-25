import { defineStore } from 'pinia';
import { computed, shallowRef } from 'vue';
import type {
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  OrgLineClasses,
  EditorExtension,
  WidgetMeta,
  EditorStore,
} from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import type { NodeType } from 'org-mode-ast';

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
  };
});
