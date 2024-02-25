import { basicOrgTheme } from './org-cm-theme';
import { closeBrackets } from '@codemirror/autocomplete';
import { bracketMatching, codeFolding } from '@codemirror/language';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view';
import { minimalSetup } from 'codemirror';
import { OrgNode } from 'org-mode-ast';
import {
  EmbeddedWidgetBuilder,
  InlineEmbeddedWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
} from 'src/api';
import { useDynamicComponent } from 'src/hooks';
import {
  editorMenuExtension,
  orgInitialFoldingExtension,
  orgInlineWidgets,
  orgLineDecoration,
  orgMultilineWidgetField,
  readOnlyTransactionFilter,
} from 'src/tools/cm-org-language/widgets';
import { orgMultilineWidgets } from 'src/tools/cm-org-language/widgets/multiline-widgets';
import {
  orgFolding,
  orgFoldingField,
} from 'src/tools/cm-org-language/widgets/org-folding';

import EditorMenu from './EditorMenu.vue';
import { EditorExtension, OrgLineClasses } from 'orgnote-api';

export function initEditorExtensions(params: {
  orgNodeGetter: () => OrgNode;
  readonly: boolean;
  showSpecialSymbols?: boolean;
  dynamicComponent: ReturnType<typeof useDynamicComponent>;
  additionalExtensions?: Extension[];
  inlineEmbeddedWidgets: InlineEmbeddedWidgets;
  multilineEmbeddedWidgets: MultilineEmbeddedWidgets;
  lineClasses: OrgLineClasses;
  extensions?: EditorExtension[];
  editorViewGetter: () => EditorView;
  foldWidget?: InlineEmbeddedWidget;
  editBadgeWidget?: EmbeddedWidgetBuilder;
}): Extension[] {
  const baseExtensions = [
    orgMultilineWidgetField,
    minimalSetup,
    bracketMatching(),
    closeBrackets(),
    codeFolding(),
    highlightActiveLine(),
    readOnlyTransactionFilter(params.orgNodeGetter),
    basicOrgTheme,
    // TODO: master optional readonly extension
    editorMenuExtension({
      parentElement: '.q-page',
      menuRenderer: (wrap: Element, editorView: EditorView) => {
        return params.dynamicComponent.mount(EditorMenu, wrap, {
          editorView,
        });
      },
    }),
    EditorView.lineWrapping,
    EditorState.readOnly.of(params.readonly),
    orgInitialFoldingExtension(params.editorViewGetter, params.orgNodeGetter),
    keymap.of([
      {
        key: 'Escape',
        run: () => {
          params.editorViewGetter()?.contentDOM.blur();
          return false;
        },
      },
    ]),
  ];

  if (params.foldWidget) {
    baseExtensions.push(
      orgFolding(
        params.orgNodeGetter,
        params.editorViewGetter,
        params.foldWidget
      ),
      orgFoldingField
    );
  }

  const specialSymbolsExtensions = !params.showSpecialSymbols
    ? [
        orgInlineWidgets(
          params.orgNodeGetter,
          params.inlineEmbeddedWidgets,
          params.readonly
        ),
        orgMultilineWidgets(
          params.orgNodeGetter,
          params.multilineEmbeddedWidgets,
          params.readonly,
          params.editBadgeWidget
        ),
        orgLineDecoration(params.orgNodeGetter, params.lineClasses),
      ]
    : [];

  const initedExtensions = params.extensions.map((ext) =>
    ext({
      orgNodeGetter: params.orgNodeGetter,
      readonly: params.readonly,
      showSpecialSymbols: params.showSpecialSymbols,
      dynamicComponent: params.dynamicComponent,
      editorViewGetter: params.editorViewGetter,
    })
  );

  return [
    ...baseExtensions,
    ...specialSymbolsExtensions,
    ...(params.additionalExtensions ?? []),
    ...initedExtensions,
  ];
}
