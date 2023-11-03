import { basicOrgTheme } from './org-cm-theme';
import { closeBrackets } from '@codemirror/autocomplete';
import { bracketMatching, codeFolding, foldGutter } from '@codemirror/language';
import { EditorState, Extension, Prec } from '@codemirror/state';
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view';
import { minimalSetup } from 'codemirror';
import { OrgNode } from 'org-mode-ast';
import { useDynamicComponent } from 'src/hooks';
import {
  InlineEmbeddedWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  editorMenuExtension,
  orgAutoInsertCommand,
  orgInitialFoldingExtension,
  orgInlineWidgets,
  orgLineDecoration,
  orgMultilineWidgetField,
  readOnlyTransactionFilter,
} from 'src/tools/cm-org-language/widgets';
import { OrgLineClasses } from 'src/tools/cm-org-language/widgets/line-decoration.model';
import { orgMultilineWidgets } from 'src/tools/cm-org-language/widgets/multiline-widgets';
import {
  orgFolding,
  orgFoldingField,
} from 'src/tools/cm-org-language/widgets/org-folding';

import EditorMenu from './EditorMenu.vue';

export function initEditorExtensions(params: {
  orgNodeGetter: () => OrgNode;
  readonly: boolean;
  showSpecialSymbols?: boolean;
  dynamicComponent: ReturnType<typeof useDynamicComponent>;
  additionalExtensions?: Extension[];
  inlineEmbeddedWidgets: InlineEmbeddedWidgets;
  multilineEmbeddedWidgets: MultilineEmbeddedWidgets;
  lineClasses: OrgLineClasses;
  editorViewGetter: () => EditorView;
  foldWidget?: InlineEmbeddedWidget;
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
    Prec.highest(
      keymap.of([
        {
          key: 'Enter',
          run: orgAutoInsertCommand(params.orgNodeGetter),
        },
      ])
    ),
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
          params.readonly
        ),
        orgLineDecoration(params.orgNodeGetter, params.lineClasses),
      ]
    : [];

  return [
    ...baseExtensions,
    ...specialSymbolsExtensions,
    ...(params.additionalExtensions ?? []),
  ];
}
