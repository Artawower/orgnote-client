<template>
  <div class="editor-wrapper" :class="{ readonly }">
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { editorLanguages } from './editor-languages';
import { basicOrgTheme } from './org-cm-theme';
import { useEmbeddedWidgets } from './use-embedded-widgets';
import { closeBrackets } from '@codemirror/autocomplete';
import { bracketMatching, codeFolding, foldGutter } from '@codemirror/language';
import { EditorState, Prec } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  highlightActiveLine,
  keymap,
} from '@codemirror/view';
import { minimalSetup } from 'codemirror';
import { OrgNode } from 'org-mode-ast';
import { onMobileViewportChanged, useDynamicComponent } from 'src/hooks';
import { orgMode } from 'src/tools/cm-org-language';
import {
  editorMenuExtension,
  orgAutoInsertCommand,
  orgInlineWidgets,
  orgLineDecoration,
  orgMultilineWidgetField,
  readOnlyTransactionFilter,
} from 'src/tools/cm-org-language/widgets';
import { orgMultilineWidgets } from 'src/tools/cm-org-language/widgets/multiline-widgets';

import { onMounted, ref, watch } from 'vue';

import EditorMenu from './EditorMenu.vue';
import GutterMarker from 'src/components/ui/GutterMarker.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    readonly?: boolean;
  }>(),
  { modelValue: () => '' }
);

const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'dataUpdated', val: [string, OrgNode]): void;
  (e: 'changeCursorPosition', val: number): void;
  (e: 'focusChanged', val: boolean): void;
  (e: 'init', val: { view: EditorView }): void;
}>();

const text = ref(props.modelValue);

let orgNode: OrgNode;

const setText = (t: string) => {
  if (props.readonly) {
    return;
  }
  text.value = t;
  emits('dataUpdated', [t, orgNode]);
};

const editor = ref<HTMLDivElement>();
let editorView: EditorView;

const { multilineEmbeddedWidgets, inlineEmbeddedWidgets, lineClasses } =
  useEmbeddedWidgets();

const dynamicComponent = useDynamicComponent();

const setCursorPositionToTheEOF = () => {
  if (!editorView) {
    return;
  }
  const lastLine = editorView.state.doc.lineAt(editorView.state.doc.length);
  editorView.dispatch({
    selection: {
      anchor: lastLine.to,
      head: lastLine.to,
    },
  });
};
// TODO: master refactor (important)
const initEditor = () => {
  if (!props.modelValue) {
    return;
  }
  editorView?.destroy();
  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) => {
          orgNode = updatedOrgNode;
        },
        wrap: editorLanguages,
      }),
      orgMultilineWidgetField,
      minimalSetup,
      bracketMatching(),
      closeBrackets(),
      codeFolding({
        placeholderText: '[…]',
      }),
      // TODO: master we need to hide fold gutter for active line
      foldGutter({
        markerDOM: (open) => {
          const gutterMarker = document.createElement('span');
          dynamicComponent.mount(GutterMarker, gutterMarker, { open });
          return gutterMarker;
        },
      }),

      highlightActiveLine(),
      readOnlyTransactionFilter(() => orgNode),
      basicOrgTheme,
      // TODO: master optional readonly extension
      editorMenuExtension({
        parentElement: '.q-page',
        menuRenderer: (wrap: Element, editorView: EditorView) => {
          return dynamicComponent.mount(EditorMenu, wrap, {
            editorView,
          });
        },
      }),
      EditorView.lineWrapping,
      EditorState.readOnly.of(props.readonly),
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          setText(v.state.doc.toString());
        }

        emits('changeCursorPosition', v.state.selection.main.head);
        changeFocus(v.view.hasFocus);
      }),
      orgInlineWidgets(() => orgNode, inlineEmbeddedWidgets),
      orgMultilineWidgets(
        () => orgNode,
        multilineEmbeddedWidgets,
        props.readonly
      ),
      orgLineDecoration(() => orgNode, lineClasses),
      Prec.highest(
        keymap.of([
          {
            key: 'Enter',
            run: orgAutoInsertCommand(() => orgNode),
          },
        ])
      ),
      keymap.of([
        {
          key: 'Escape',
          run: () => {
            editorView.contentDOM.blur();
            return false;
          },
        },
      ]),
    ],
  });

  editorView = new EditorView({
    state: startState,
    parent: editor.value,
  });

  emits('init', { view: editorView });
  setCursorPositionToTheEOF();
};

const focus = ref<boolean>(false);
const changeFocus = (hasFocus: boolean) => {
  if (focus.value === hasFocus) {
    return;
  }
  focus.value = hasFocus;
  emits('focusChanged', hasFocus);
};

const { keyboardOpened } = onMobileViewportChanged();

watch(
  () => keyboardOpened.value,
  (opened) => {
    if (opened) {
      setTimeout(() => scrollIntoCurrentLine(), 100);
    }
  }
);

const scrollIntoCurrentLine = () => {
  console.log('SCROLL INTO CURRENT LINE');
  window.scroll(0, -1);
  editorView.dispatch({
    selection: {
      anchor: editorView.state.selection.main.head,
      head: editorView.state.selection.main.head,
    },
    scrollIntoView: true,
  });
};

onMounted(() => initEditor());

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === editorView?.state.doc.toString()) {
      return;
    }
    initEditor();
  }
);

watch(
  () => props.readonly,
  () => {
    if (!editorView) {
      return;
    }
    initEditor();
  }
);
</script>

<style lang="scss">
/* TODO: master simplify classes for CM */
.editor-wrapper {
  width: 100%;
  height: 100%;
  max-width: var(--content-max-width);
  margin: auto;
}

#editor {
  font-family: var(--editor-font-family-main);
}

.ql-editor {
  &:focus {
    outline: none;
  }

  p {
    margin: 0;
  }
}

.ql-clipboard {
  display: none;
}

.ql-syntax {
  overflow: auto;
}

.org-bold {
  font-weight: bold;
}

@for $i from 1 through 12 {
  .org-headline-#{$i} {
    font-family: var(--headline-font-family);
    font-weight: var(--headline-font-weight);
    display: inline-block;

    &.org-operator {
      display: none;
    }
  }
}

.org-bold,
.org-italic,
.org-verbatim,
.org-inline-code,
.org-crossed {
  &.org-operator {
    display: none;
  }
}

.org-bold {
  font-weight: bold;
}

.org-italic {
  font-style: italic;
}

.org-crossed {
  text-decoration: line-through;
  color: var(--fg-alt);
}

.org-file-tag {
  color: var(--base8) !important;
}

.org-keyword.org-operator {
  color: var(--base8);
  padding: 4px;
}

.org-link {
  color: var(--fg);
  text-decoration: underline;
  cursor: pointer;
}

.org-doc-title-keyword {
  display: none;
}

.cm-gutters,
.cm-gutter {
  background: transparent;
  background-color: transparent !important;
  border-right: 0 !important;
}

.org-property-drawer {
  color: var(--fg-alt);
  font-family: var(--editor-font-family-main);
}

.cm-line,
.org-text,
.header-text {
  letter-spacing: 0.5px;
  font-size: var(--paragraph-font-size);
  font-family: var(--main-font-family);
  color: var(--fg);
  -webkit-font-smoothing: auto;
}

.cm-line:not(.org-src-block-line) {
  line-height: var(--editor-line-height);
}

.cm-tag-name,
.cm-angle-bracket {
  color: var(--yellow);
}

.org-keyword,
.cm-line-comment,
.org-block-property,
.org-comment {
  color: var(--fg-alt);
}

.org-src-block,
.org-quote-block.org-keyword {
  font-size: var(--code-font-size);
  font-family: var(--editor-font-family-main);
}

.org-src-language {
  color: var(--yellow);
}

.cm-string,
.cm-regexp {
  color: var(--green);
}

.cm-definition-keyword,
.cm-keyword,
.cm-control-keyword,
.cm-type-name,
.cm-type-definition,
.cm-property-definition,
.cm-private-property-definition {
  color: var(--violet);
}

.cm-variable-name,
.cm-bool {
  color: var(--fg);
}

.cm-property-name,
.cm-name {
  color: var(--blue);
}

.cm-activeLine {
  .org-operator,
  .org-link-url,
  .org-doc-title-keyword {
    display: inline !important;
  }
}

.org-verbatim,
.org-inline-code {
  &:not(.org-operator) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    border-radius: 6px;
    background-color: var(--inline-code-background);
    color: var(--inline-code-font-color);
  }
}

.cm-attribute-value {
  color: var(--green);
}

.org-headline-1 {
  font-size: 2rem;
}

.org-headline-2 {
  font-size: 1.8rem;
}

.org-headline-3 {
  font-size: 1.6rem;
}

.org-headline-4 {
  font-size: 1.4rem;
}

.org-headline-5 {
  font-size: 1.2rem;
}

.org-checkbox {
  color: var(--green);
}

.org-headline-6,
.org-headline-7,
.org-headline-8,
.org-headline-9,
.org-headline-10,
.org-headline-11,
.org-headline-12 {
  font-size: 1rem;
}

.org-priority-1 {
  color: var(--red);
}

.org-priority-2 {
  color: var(--orange);
}

.org-priority-3 {
  color: var(--yellow);
}

.org-priority-4 {
  color: var(--blue);
}

.org-priority-5 {
  color: var(--base8);
}

.org-priority-6 {
  color: var(--green);
}

.cm-line {
  > .org-quote-block:not(.org-keyword):first-child {
    padding-left: 16px;
    position: relative;

    &::before {
      content: '┃';
      color: var(--base8);
      position: absolute;
      left: -4px;
      transform: scaleY(var(--editor-line-height));
    }
  }
}

.org-keyword-todo,
.org-keyword-wait,
.org-keyword-hold {
  color: var(--yellow);
}

.org-keyword-done,
.org-keyword-idea {
  color: var(--green);
}

.org-keyword-kill,
.org-keyword-rejected,
org-keyword-block {
  color: var(--red);
}

.org-widget-edit-badge {
  color: var(--fg-alt);
  opacity: 0;
  z-index: 1000;
  cursor: pointer;
  transition-delay: 0.1s;
  left: -36px;
  top: 0;

  &:hover {
    opacity: 1;
    color: var(--base8);
  }
}

.org-multiline-widget {
  &:hover,
  &:active {
    .org-widget-edit-badge {
      opacity: 1;
    }
  }
}

.org-doc-title {
  color: var(--fg);
}

.org-headline-line {
  padding-top: 16px !important;
}

.org-src-line {
  background-color: var(--base7);
}

.org-src-block-line {
  background: var(--base7) !important;
  padding-left: var(--src-block-padding-x) !important;
  padding-right: var(--src-block-padding-x) !important;
}

.org-block-header {
  position: relative;
}

.org-block-footer {
  border-bottom-right-radius: var(--default-item-radius);
  border-bottom-left-radius: var(--default-item-radius);
  padding-bottom: var(--src-block-footer-padding-y) !important;
}

.org-block-header {
  border-top-right-radius: var(--default-item-radius);
  border-top-left-radius: var(--default-item-radius);
  padding-top: var(--src-block-header-padding-y) !important;
  padding-bottom: var(--src-block-header-padding-y) !important;
}

// Readonly mode

.org-list-bullet {
  color: var(--fg-alt);
  position: absolute;
  left: -8px;

  display: inline-block;
  transform: scale(1.6);
  width: 16px;
}

/* FIXME: hack for empty line with absolute bullet */
.org-list-item-line.cm-activeLine {
  min-height: 28.8px;
}

.org-list-item-checked {
  .org-list-item:not(.org-checkbox) {
    text-decoration: line-through;
    color: var(--fg-alt);
  }
}

.org-operator.org-list-item:first-child {
  display: inline-block;
  color: var(--fg-alt);
}

.org-list-item-line {
  position: relative;
  margin-left: 8px;
}

.org-list-item-bullet-line {
  margin-left: 24px;
}

.org-list-item-section-line {
  margin-left: 40px;
  position: relative;

  > .org-list-item:first-of-type {
    margin-left: -4.6px;
  }

  &::before {
    content: '';
    display: block;
    position: absolute;
    left: -8px;
    height: 100%;
    border-left: 1px solid var(--base7);
  }
}

.cm-action-menu {
  width: 48px;
  left: -32px;
}

.org-keyword-title-line {
  .org-keyword {
    font-size: 2rem;
    font-weight: var(--headline-font-weight);
    font-family: var(--headline-font-family);
  }
  .org-keyword:not(:first-of-type) {
    color: var(--fg);
  }
}

.org-keyword-description-line,
.org-keyword-title-line,
.org-keyword-filetags-line {
  &:not(.cm-activeLine) {
    .org-keyword:first-of-type {
      display: none !important;
    }
    > *:not(:first-of-type) {
      margin-left: -6px;
    }
  }
}

.org-keyword-description-line {
  .org-keyword:not(:first-of-type) {
    font-style: italic;
    font-weight: bold;
    font-size: 1.2rem;
  }
}

@include mobile {
  .editor-wrapper {
    .cm-editor-actions {
      flex-direction: column-reverse;
    }

    .cm-action-menu {
      display: none;
    }

    .cm-scroller {
      padding: var(--mobile-editor-padding);
      outline: none !important;
    }

    .cm-gutters {
      position: absolute !important;
      left: 0;
    }

    .cm-gutterElement {
      margin-left: -5px;
    }

    .org-headline-line {
      margin-left: 14px;
    }

    .org-widget-edit-badge {
      right: 8px;
      top: 8px;
      opacity: 1;
      left: unset;
    }

    .cm-line {
      padding-left: var(--default-block-padding);
      padding-right: var(--default-block-padding);
    }
  }
}

.readonly {
  .cm-cursor,
  .cm-dropCursor {
    display: none !important;
    border-color: transparent !important;
  }

  .org-property-drawer,
  .org-operator,
  .cm-action-menu {
    display: none !important;
  }

  .org-src-block-line {
    .org-keyword {
      display: none !important;
    }
  }

  .org-keyword-line {
    .org-keyword:first-of-type {
      display: none !important;
    }

    .org-keyword {
      margin-left: -10px;
    }
  }

  .org-widget-edit-badge {
    display: none !important;
  }
}
</style>
