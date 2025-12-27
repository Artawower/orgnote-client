import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view';
import { closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';
import { computed, shallowRef, watch, toValue } from 'vue';
import type { OrgNode, NodeType } from 'org-mode-ast';
import { api } from 'src/boot/api';
import type {
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  InlineEmbeddedWidget,
  MultilineEmbeddedWidget,
  EditorExtension,
} from 'orgnote-api';
import { useWidgetBuilder } from 'src/composables/use-widget-builder';
import { useDynamicComponent } from 'src/utils/dynamic-component';

import {
  orgNodeGetterFacet,
  readonlyFacet,
  inlineWidgetsFacet,
  multilineWidgetsFacet,
  lineClassesFacet,
  type OrgNodeGetter,
} from './facets';
import {
  orgInlineWidgets,
  orgMultilineWidgetField,
  orgLineDecoration,
  readOnlyTransactionFilter,
} from './widgets';
import { orgMultilineWidgets } from './widgets/multiline-widgets';
import { orgMode } from './org-parser';
import { editorLanguages } from './editor-languages';

export interface UseEditorStateOptions {
  readonly?: boolean;
  editorViewGetter: () => EditorView | undefined;
  onContentUpdate: (content: string) => void;
}

const createBaseExtensions = (editorViewGetter: () => EditorView | undefined): Extension[] => [
  history(),
  keymap.of([...defaultKeymap, ...historyKeymap]),
  bracketMatching(),
  closeBrackets(),
  EditorView.lineWrapping,
  keymap.of([
    {
      key: 'Escape',
      run: () => {
        editorViewGetter()?.contentDOM.blur();
        return false;
      },
    },
  ]),
];

const createUpdateListener = (onUpdate: (content: string) => void): Extension =>
  EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    onUpdate(update.state.doc.toString());
  });

const createWidgetExtensions = (): Extension[] => [
  orgMultilineWidgetField,
  readOnlyTransactionFilter,
  orgInlineWidgets,
  orgMultilineWidgets,
  orgLineDecoration,
];

export const useEditorState = (options: UseEditorStateOptions) => {
  const configStore = api.core.useConfig();
  const editorStore = api.core.useEditor();
  const editorConfig = computed(() => configStore.config.editor);
  const { createWidgetBuilder, createMultilineWidgetBuilder } = useWidgetBuilder();
  const dynamicComponent = useDynamicComponent();

  const compartments = {
    readonly: new Compartment(),
    widgets: new Compartment(),
    editorExtensions: new Compartment(),
  };

  const orgNode = shallowRef<OrgNode | null>(null);
  const getOrgNode: OrgNodeGetter = () => orgNode.value;

  const handleOrgNodeChanged = (node: OrgNode) => {
    orgNode.value = node;
  };

  type Widget = InlineEmbeddedWidget | MultilineEmbeddedWidget;

  const buildWidgets = <T extends InlineEmbeddedWidgets | MultilineEmbeddedWidgets>(
    widgets: T,
    builderFn: typeof createWidgetBuilder,
  ): T =>
    Object.entries(widgets).reduce((acc, [nodeType, widgetList]) => {
      if (!widgetList) return acc;
      return {
        ...acc,
        [nodeType as NodeType]: (widgetList as Widget[]).map((widget) => ({
          ...widget,
          widgetBuilder:
            widget.component && !widget.widgetBuilder
              ? builderFn(widget.component, widget.componentProps)
              : widget.widgetBuilder,
        })),
      };
    }, {} as T);

  const buildInlineWidgets = () =>
    buildWidgets(toValue(editorStore.inlineWidgets), createWidgetBuilder);

  const buildMultilineWidgets = () =>
    buildWidgets(toValue(editorStore.multilineWidgets), createMultilineWidgetBuilder);

  const createFacetExtensions = (readonly: boolean): Extension[] => {
    return [
      orgNodeGetterFacet.of(getOrgNode),
      readonlyFacet.of(readonly),
      inlineWidgetsFacet.of(buildInlineWidgets()),
      multilineWidgetsFacet.of(buildMultilineWidgets()),
      lineClassesFacet.of(toValue(editorStore.lineClasses)),
    ];
  };

  const buildEditorExtensions = (readonly: boolean): Extension[] => {
    const extensions = toValue(editorStore.extensions) as EditorExtension[];

    return extensions.map((ext) =>
      ext({
        orgNodeGetter: getOrgNode,
        readonly,
        showSpecialSymbols: editorConfig.value.showSpecialSymbols,
        dynamicComponent,
        editorViewGetter: options.editorViewGetter,
      }),
    );
  };

  const createState = (content: string): EditorState => {
    const readonly = options.readonly ?? false;
    const widgetExtensions = editorConfig.value.showSpecialSymbols ? [] : createWidgetExtensions();

    return EditorState.create({
      doc: content,
      extensions: [
        ...createBaseExtensions(options.editorViewGetter),
        highlightActiveLine(),
        createUpdateListener(options.onContentUpdate),
        compartments.readonly.of(EditorState.readOnly.of(readonly)),
        compartments.widgets.of([...createFacetExtensions(readonly), ...widgetExtensions]),
        compartments.editorExtensions.of(buildEditorExtensions(readonly)),
        orgMode({
          wrap: editorLanguages,
          orgAstChanged: handleOrgNodeChanged,
        }),
      ],
    });
  };

  const reconfigureReadonly = (view: EditorView, value: boolean): void => {
    view.dispatch({
      effects: compartments.readonly.reconfigure(EditorState.readOnly.of(value)),
    });
  };

  const reconfigureWidgets = (view: EditorView): void => {
    const readonly = options.readonly ?? false;
    const widgetExtensions = editorConfig.value.showSpecialSymbols ? [] : createWidgetExtensions();

    view.dispatch({
      effects: [
        compartments.widgets.reconfigure([
          ...createFacetExtensions(readonly),
          ...widgetExtensions,
        ]),
        compartments.editorExtensions.reconfigure(buildEditorExtensions(readonly)),
      ],
    });
  };

  const setupWidgetsWatcher = (viewGetter: () => EditorView | undefined): void => {
    watch(
      [
        () => editorConfig.value.showSpecialSymbols,
        () => editorStore.inlineWidgets,
        () => editorStore.multilineWidgets,
        () => editorStore.lineClasses,
        () => editorStore.extensions,
      ],
      () => {
        const view = viewGetter();
        if (view) reconfigureWidgets(view);
      },
    );
  };

  return {
    orgNode,
    createState,
    reconfigureReadonly,
    reconfigureWidgets,
    setupWidgetsWatcher,
  };
};
