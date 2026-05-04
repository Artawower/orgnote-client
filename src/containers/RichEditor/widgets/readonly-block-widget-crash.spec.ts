import { afterEach, beforeEach, expect, test } from 'vitest';
import { EditorState } from '@codemirror/state';
import type { DecorationSet } from '@codemirror/view';
import { Decoration, EditorView } from '@codemirror/view';
import { NodeType, parse, withMetaInfo } from 'org-mode-ast';
import type { InlineEmbeddedWidget, MultilineEmbeddedWidget } from 'orgnote-api';
import {
  orgNodeGetterFacet,
  readonlyFacet,
  inlineWidgetsFacet,
  multilineWidgetsFacet,
} from '../facets';
import { orgInlineWidgets } from './org-mode-decoration';
import { createMultilineWidgetsField } from './multiline-widgets';

const DOC_QUOTE_WITH_ITALIC = '#+begin_quote\n/italic text/\n#+end_quote';

const makeQuoteBlockWidget = (): MultilineEmbeddedWidget => ({
  id: 'test-quote-widget',
  widgetBuilder: ({ wrap }) => {
    wrap.textContent = 'quote';
    return { destroy: () => {} };
  },
});

const makeItalicInlineWidget = (): InlineEmbeddedWidget => ({
  id: 'test-italic-widget',
  decorationType: 'replace',
  ignoreEditing: true,
  widgetBuilder: ({ wrap }) => {
    wrap.textContent = 'italic';
    return { destroy: () => {} };
  },
});

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

const hasDecorationsInRange = (decorations: DecorationSet, from: number, to: number): boolean => {
  let found = false;
  decorations.between(from, to, () => {
    found = true;
  });
  return found;
};

const createReadonlyEditorWithQuoteAndItalicWidgets = () => {
  const orgNode = withMetaInfo(parse(DOC_QUOTE_WITH_ITALIC));
  const editorViewRef = { current: null as EditorView | null };
  const multilineField = createMultilineWidgetsField(editorViewRef);

  const view = new EditorView({
    state: EditorState.create({
      doc: DOC_QUOTE_WITH_ITALIC,
      extensions: [
        readonlyFacet.of(true),
        orgNodeGetterFacet.of(() => orgNode),
        multilineWidgetsFacet.of({ [NodeType.QuoteBlock]: [makeQuoteBlockWidget()] }),
        inlineWidgetsFacet.of({ [NodeType.Italic]: [makeItalicInlineWidget()] }),
        multilineField,
        orgInlineWidgets,
      ],
    }),
    parent: container,
  });

  editorViewRef.current = view;
  return { view, multilineField };
};

test('orgInlineWidgets does not place inline decorations inside block widget ranges in readonly mode', () => {
  const { view } = createReadonlyEditorWithQuoteAndItalicWidgets();
  const inlineDecorations = view.plugin(orgInlineWidgets)?.decorations ?? Decoration.none;

  expect(hasDecorationsInRange(inlineDecorations, 0, DOC_QUOTE_WITH_ITALIC.length)).toBe(false);

  view.destroy();
});

test('multiline widget field does not rebuild when cursor moves in readonly mode', () => {
  const { view, multilineField } = createReadonlyEditorWithQuoteAndItalicWidgets();

  const decorationsBeforeCursorMove = view.state.field(multilineField);
  view.dispatch({ selection: { anchor: DOC_QUOTE_WITH_ITALIC.indexOf('/italic text/') } });
  const decorationsAfterCursorMove = view.state.field(multilineField);

  expect(decorationsAfterCursorMove).toBe(decorationsBeforeCursorMove);

  view.destroy();
});

test('orgInlineWidgets does not rebuild decorations on cursor movement in readonly mode', () => {
  const doc = '/italic text/';
  const orgNode = withMetaInfo(parse(doc));

  const view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: [
        readonlyFacet.of(true),
        orgNodeGetterFacet.of(() => orgNode),
        inlineWidgetsFacet.of({ [NodeType.Italic]: [makeItalicInlineWidget()] }),
        orgInlineWidgets,
      ],
    }),
    parent: container,
  });

  const plugin = view.plugin(orgInlineWidgets);
  const decorationsBeforeCursorMove = plugin?.decorations;
  view.dispatch({ selection: { anchor: doc.indexOf('italic') } });
  const decorationsAfterCursorMove = plugin?.decorations;

  expect(decorationsAfterCursorMove).toBe(decorationsBeforeCursorMove);

  view.destroy();
});
