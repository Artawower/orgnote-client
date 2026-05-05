import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view';
import { closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';
import { computed, shallowRef, watch, toValue } from 'vue';
import type { OrgNode } from 'org-mode-ast';
import { api } from 'src/boot/api';
import type {
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  InlineEmbeddedWidget,
  MultilineEmbeddedWidget,
  EditorExtension,
  WidgetBuilder,
} from 'orgnote-api';
import { useWidgetBuilder } from 'src/composables/use-widget-builder';
import { useDynamicComponent } from 'src/utils/dynamic-component';
import { getNumericCssVar } from 'src/utils/css-utils';

import {
  orgNodeGetterFacet,
  readonlyFacet,
  inlineWidgetsFacet,
  multilineWidgetsFacet,
  lineClassesFacet,
  type OrgNodeGetter,
} from './facets';
import { orgInlineWidgets, orgLineDecoration, readOnlyTransactionFilter } from './widgets';
import { createMultilineWidgetsField } from './widgets/multiline-widgets';
import { orgMode } from './org-parser';
import { editorLanguages } from './editor-languages';

export interface UseEditorStateOptions {
  readonly?: boolean;
  readonlyGetter?: () => boolean;
  filePathGetter?: () => string | undefined;
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

const createWidgetExtensions = (editorViewRef: { current: EditorView | null }): Extension[] => [
  readOnlyTransactionFilter,
  orgInlineWidgets,
  createMultilineWidgetsField(editorViewRef),
  orgLineDecoration,
];

const getToolbarHeight = (): number => {
  const toolbarHeight = getNumericCssVar('--editor-toolbar-height') ?? 52;
  const footerPadding = getNumericCssVar('--footer-wrapper-padding-y') ?? 0;
  const additionalOffset = 8;
  return toolbarHeight + footerPadding + additionalOffset;
};

const createScrollMarginsExtension = (keyboardOpened: boolean, isMobile: boolean): Extension =>
  EditorView.scrollMargins.of(() => {
    if (!isMobile || !keyboardOpened) return null;
    return { bottom: getToolbarHeight() };
  });

export const useEditorState = (options: UseEditorStateOptions) => {
  const configStore = api.core.useConfig();
  const editorStore = api.core.useEditor();
  const editorConfig = computed(() => configStore.config.editor);
  const { createWidgetBuilder, createMultilineWidgetBuilder } = useWidgetBuilder();
  const dynamicComponent = useDynamicComponent();
  const { keyboardOpened } = api.ui.useKeyboardState();
  const { tabletBelow } = api.ui.useScreenDetection();

  const editorViewRef: { current: EditorView | null } = { current: null };

  const compartments = {
    readonly: new Compartment(),
    widgets: new Compartment(),
    editorExtensions: new Compartment(),
    scrollMargins: new Compartment(),
  };

  const orgNode = shallowRef<OrgNode | null>(null);
  const getOrgNode: OrgNodeGetter = () => orgNode.value;

  const handleOrgNodeChanged = (node: OrgNode) => {
    orgNode.value = node;
    editorStore.updateActiveContext({ orgNode: node });
  };

  const createCursorTracker = (): Extension =>
    EditorView.updateListener.of((update) => {
      if (!update.selectionSet) return;
      const { from, to, head } = update.state.selection.main;
      const selection = from !== to ? update.state.sliceDoc(from, to) : '';

      editorStore.updateActiveContext({
        cursorPosition: head,
        selection,
      });
    });

  const createFocusHandler = (): Extension =>
    EditorView.domEventHandlers({
      focus: () => {
        editorStore.setActiveContext({
          orgNode: orgNode.value,
          cursorPosition: 0,
          selection: '',
          editorViewGetter: options.editorViewGetter,
          filePath: options.filePathGetter?.(),
          focused: true,
        });
        return false;
      },
      blur: () => {
        editorStore.updateActiveContext({ focused: false });
        return false;
      },
      touchstart: (evt, view) => {
        const { from, to } = view.state.selection.main;
        if (from !== to) {
          evt.stopPropagation();
        }
        return false;
      },
      touchmove: (evt, view) => {
        const { from, to } = view.state.selection.main;
        if (from !== to) {
          evt.stopPropagation();
        }
        return false;
      },
    });

  type Widget = InlineEmbeddedWidget | MultilineEmbeddedWidget;
  type WidgetEntries<T extends InlineEmbeddedWidgets | MultilineEmbeddedWidgets> = Array<
    readonly [string, T[keyof T]]
  >;

  const toWidgetEntries = <T extends InlineEmbeddedWidgets | MultilineEmbeddedWidgets>(
    widgets: T,
  ): WidgetEntries<T> => Object.entries(widgets) as WidgetEntries<T>;

  const resolveInlineWidgetBuilder = (widget: Widget, builderFn: typeof createWidgetBuilder) => {
    if (!widget.component || widget.widgetBuilder) {
      return widget.widgetBuilder;
    }

    return builderFn(widget.component, widget.componentProps);
  };

  const multilineBuilderCache = new WeakMap<MultilineEmbeddedWidget, WidgetBuilder>();

  const resolveMultilineWidgetBuilder = (widget: MultilineEmbeddedWidget) => {
    if (!widget.component || widget.widgetBuilder) {
      return widget.widgetBuilder;
    }

    const cached = multilineBuilderCache.get(widget);
    if (cached) return cached;

    const builder = createMultilineWidgetBuilder(widget.component, widget);
    multilineBuilderCache.set(widget, builder);
    return builder;
  };

  const buildWidgets = <T extends InlineEmbeddedWidgets | MultilineEmbeddedWidgets>(
    widgets: T,
    builderFn: typeof createWidgetBuilder,
  ): T =>
    Object.fromEntries(
      toWidgetEntries(widgets).flatMap(([nodeType, widgetList]) => {
        if (!widgetList) return [];

        const mappedWidgets = (widgetList as Widget[]).map((widget) => ({
          ...widget,
          widgetBuilder: resolveInlineWidgetBuilder(widget, builderFn),
        }));

        return [[nodeType, mappedWidgets] as const];
      }),
    ) as T;

  const buildInlineWidgets = () =>
    buildWidgets(toValue(editorStore.inlineWidgets), createWidgetBuilder);

  const buildMultilineWidgets = () => {
    const result: Partial<MultilineEmbeddedWidgets> = {};

    for (const [nodeType, widgetList] of toWidgetEntries(toValue(editorStore.multilineWidgets))) {
      if (!widgetList) continue;

      result[nodeType as keyof MultilineEmbeddedWidgets] = widgetList.map((widget) => ({
        ...widget,
        widgetBuilder: resolveMultilineWidgetBuilder(widget),
      }));
    }

    return result as MultilineEmbeddedWidgets;
  };

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

  const getReadonly = (): boolean => options.readonlyGetter?.() ?? false;

  const createReadonlyExtensions = (readonly: boolean): Extension[] => [
    EditorState.readOnly.of(readonly),
    ...(readonly ? [] : [highlightActiveLine()]),
  ];

  const createState = (content: string): EditorState => {
    const readonly = getReadonly();
    const widgetExtensions = editorConfig.value.showSpecialSymbols
      ? []
      : createWidgetExtensions(editorViewRef);

    return EditorState.create({
      doc: content,
      extensions: [
        ...createBaseExtensions(options.editorViewGetter),
        createUpdateListener(options.onContentUpdate),
        createCursorTracker(),
        createFocusHandler(),
        compartments.readonly.of(createReadonlyExtensions(readonly)),
        compartments.widgets.of([...createFacetExtensions(readonly), ...widgetExtensions]),
        compartments.editorExtensions.of(buildEditorExtensions(readonly)),
        compartments.scrollMargins.of(
          createScrollMarginsExtension(keyboardOpened.value, tabletBelow.value),
        ),
        orgMode({
          wrap: editorLanguages,
          orgAstChanged: handleOrgNodeChanged,
        }),
      ],
    });
  };

  const reconfigureReadonly = (view: EditorView, value: boolean): void => {
    view.dispatch({
      effects: compartments.readonly.reconfigure(createReadonlyExtensions(value)),
    });
  };

  const reconfigureWidgets = (view: EditorView, readonlyOverride?: boolean): void => {
    const readonly = readonlyOverride !== undefined ? readonlyOverride : getReadonly();
    const widgetExtensions = editorConfig.value.showSpecialSymbols
      ? []
      : createWidgetExtensions(editorViewRef);

    view.dispatch({
      effects: [
        compartments.widgets.reconfigure([...createFacetExtensions(readonly), ...widgetExtensions]),
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

  const setupScrollMarginsWatcher = (viewGetter: () => EditorView | undefined): void => {
    watch([keyboardOpened, tabletBelow], ([newKeyboard, newTablet], [oldKeyboard]) => {
      const view = viewGetter();
      if (!view) return;

      const scrollMarginsExtension = createScrollMarginsExtension(newKeyboard, newTablet);
      const isKeyboardOpening = !oldKeyboard && newKeyboard && newTablet;

      view.dispatch({
        effects: compartments.scrollMargins.reconfigure(scrollMarginsExtension),
        scrollIntoView: isKeyboardOpening,
      });
    });
  };

  const setEditorView = (view: EditorView | null): void => {
    editorViewRef.current = view;
  };

  return {
    orgNode,
    createState,
    reconfigureReadonly,
    reconfigureWidgets,
    setupWidgetsWatcher,
    setupScrollMarginsWatcher,
    setEditorView,
  };
};
