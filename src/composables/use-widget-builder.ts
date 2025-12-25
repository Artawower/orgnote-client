import { h, type Component } from 'vue';
import type { WidgetBuilder, WidgetBuilderParams, EmbeddedWidget } from 'orgnote-api';
import { useDynamicComponent } from 'src/utils/dynamic-component';
import MultilineWidgetWrapper from 'src/containers/RichEditor/widgets/MultilineWidgetWrapper.vue';

const textToKebab = (text: string): string =>
  text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export const useWidgetBuilder = () => {
  const dynamicComponent = useDynamicComponent();

  const createWidgetBuilder = (
    cmp: Component,
    props: Record<string, unknown> = {},
  ): WidgetBuilder => {
    return (params: WidgetBuilderParams): EmbeddedWidget => {
      const normalizedType = textToKebab(params.orgNode.type);
      params.wrap.classList.add(`org-embedded-${normalizedType}`);

      return dynamicComponent.mount(cmp, params.wrap, {
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
        {
          default: ({ actionsId }: { actionsId: string }) =>
            h(cmp, {
              ...props,
              node: params.orgNode,
              nodeGetter: params.orgNodeGetter,
              editorView: params.editorView,
              rootNodeSrc: params.rootNodeSrc,
              readonly: params.readonly,
              actionsId,
              onUpdate: (newVal: string) => params.onUpdateFn?.(newVal),
            }),
        },
      );

      return dynamicComponent.mount(wrappedComponent, params.wrap);
    };
  };

  return {
    createWidgetBuilder,
    createMultilineWidgetBuilder,
  };
};
