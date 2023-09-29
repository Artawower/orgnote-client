<template>
  <div class="editor-wrapper">
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { editorLanguages } from './editor-languages';
import { basicOrgTheme } from './org-cm-theme';
import { useEmbeddedWidgets } from './use-embedded-widgets';
import { closeBrackets } from '@codemirror/autocomplete';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate, highlightActiveLine } from '@codemirror/view';
import { minimalSetup } from 'codemirror';
import { OrgNode } from 'org-mode-ast';
import { useDynamicComponent } from 'src/hooks';
import { OrgUpdatedEffect, orgMode } from 'src/tools/cm-org-language';
import {
  editorMenuExtension,
  orgInlineWidgets,
  orgMultilineWidgetField,
  readOnlyTransactionFilter,
} from 'src/tools/cm-org-language/widgets';
import { orgMultilineWidgets } from 'src/tools/cm-org-language/widgets/multiline-widgets';

import { onMounted, ref, watch } from 'vue';

import EditorMenu from './EditorMenu.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
  }>(),
  { modelValue: () => '' }
);

const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'dataUpdated', val: [string, OrgNode]): void;
}>();

const text = ref(props.modelValue);
console.log('✎: [line 43][table] text: ', text.value);

let orgNode: OrgNode;

const setText = (t: string) => {
  text.value = t;
  emits('dataUpdated', [t, orgNode]);
};

const editor = ref<HTMLDivElement>();
let editorView: EditorView;

const { multilineEmbeddedWidgets, inlineEmbeddedWidgets } =
  useEmbeddedWidgets();

const dynamicComponent = useDynamicComponent();

const initEditor = () => {
  if (!props.modelValue) {
    return;
  }
  editorView?.destroy();
  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      orgMultilineWidgetField,
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) => {
          orgNode = updatedOrgNode;
          editorView?.dispatch({
            effects: OrgUpdatedEffect.of(updatedOrgNode),
          });
        },
        wrap: editorLanguages,
      }),
      minimalSetup,
      bracketMatching(),
      indentOnInput(),
      closeBrackets(),
      highlightActiveLine(),
      readOnlyTransactionFilter(() => orgNode),
      editorMenuExtension({
        parentElement: '.q-page',
        menuRenderer: (wrap: Element, editorView: EditorView) => {
          return dynamicComponent.mount(EditorMenu, wrap, {
            editorView,
          });
        },
      }),
      basicOrgTheme,
      EditorView.lineWrapping,
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          setText(v.state.doc.toString());
        }
      }),
      orgInlineWidgets(() => orgNode, inlineEmbeddedWidgets),
      orgMultilineWidgets(() => orgNode, multilineEmbeddedWidgets),
    ],
  });

  editorView = new EditorView({
    state: startState,
    parent: editor.value,
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
</script>

<style lang="scss">
@import 'src/tools/cm-org-language/theme.scss';

.editor-wrapper {
  width: 100%;
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
    display: inline-block;
    margin-top: 16px;

    &.org-operator {
      display: none;
    }
  }
}

.org-link,
.org-bold,
.org-italic,
.org-verbatim,
.org-inline-code,
.org-crossed {
  &.org-operator {
    display: none;
  }
}

.org-link {
  color: var(--blue);
  text-decoration: underline;
  cursor: pointer;
}

.org-link-url,
.org-doc-title-keyword {
  display: none;
}

.CodeMirror-wrap pre {
  word-break: break-word;
}

.cm-gutters,
.cm-gutter {
  background: transparent;
  background-color: transparent !important;
  border-right: 0 !important;
}

.Codemirror,
.vue-codemirror,
.cm-editor {
  height: 100%;
}

.cm-focused {
  outline: none !important;
}

.org-property-drawer {
  color: var(--cyan);
}

/* TODO: feature/codemirror change font style for editor */
.cm-line,
.org-text,
.header-text {
  font-size: var(--paragraph-font-size);
  font-family: var(--editor-font-family-main);
}

/* .cm-content,
.cm-activeLine.cm-line,
div.cm-content.cm-lineWrapping .cm-line,
.cm-line {
  caret-color: var(--fg) !important;
}
 */
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
  background-color: unset !important;

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

  .org-priority {
    color: var(--green);
  }
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
  color: var(--cyan);
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
      color: var(--cyan);
      position: absolute;
      left: -4px;
      transform: scale(1.1);
    }
  }
}

[class^='org-keyword-'] {
  font-weight: bold;
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

.cm-scroller {
  padding: 0 30px;
}

.org-widget-edit-badge {
  color: var(--fg-alt);
  opacity: 0;
  transition-delay: 0.3s;

  &:hover {
    opacity: 1;
    color: var(--cyan);
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

.org-doc-title-keyword,
.org-doc-title {
  font-size: 2rem;
}

.cm-line:not(.cm-activeLine) {
  .org-doc-title {
    margin-left: -20px;
  }
}

.org-doc-title {
  color: var(--fg);
}
</style>
