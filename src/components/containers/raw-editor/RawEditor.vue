<template>
  <div class="editor-wrapper">
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { closeBrackets } from '@codemirror/autocomplete';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  ViewUpdate,
  highlightActiveLine,
  rectangularSelection,
} from '@codemirror/view';
import {
  LanguageName,
  langs,
  loadLanguage,
} from '@uiw/codemirror-extensions-langs';
import { minimalSetup } from 'codemirror';
import { OrgNode, parse } from 'org-mode-ast';
import { OrgUpdatedEffect, orgMode } from 'src/tools/cm-org-language';
import { newOrgModeDecorationPlugin } from 'src/tools/cm-org-language/widgets';

import { getCurrentInstance, onMounted, ref, toRef, watch } from 'vue';

// TODO: master refactor. Move editor definition to separate file
const supportedLanguages: LanguageName[] = [
  'angular',
  'c',
  'clojure',
  'commonLisp',
  'cpp',
  'css',
  'dart',
  'go',
  'java',
  'javascript',
  'json',
  'kotlin',
  'mysql',
  'php',
  'python',
  'sass',
  'sql',
  'shell',
  'dockerfile',
  'r',
  'toml',
  'ruby',
  'rust',
  'html',
  'csharp',
  'scala',
];

supportedLanguages.forEach((lang) => loadLanguage(lang));

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

const text = toRef(props.modelValue);

let orgNode: OrgNode;

const setText = (t: string) => {
  text.value = t;
  emits('dataUpdated', [t, orgNode]);
};

const editor = ref<HTMLDivElement>();
let editorView: EditorView;
const vueInstance = getCurrentInstance();

const initEditor = () => {
  if (!props.modelValue) {
    return;
  }
  editorView?.destroy();
  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: [
      // TODO: Doens't return value in the plugins. Check
      // orgNodeField.extension,
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) => {
          orgNode = updatedOrgNode;
          editorView?.dispatch({
            effects: OrgUpdatedEffect.of(updatedOrgNode),
          });
          // console.log(
          //   '✎: [line 89][checkbox] editorView: ',
          //   editorView?.state.field(orgNodeField)
          // );
          // TODO: master  doesn't work in the widget view
          // console.log(editorView?.state.field(orgNodeField));
        },
        wrap: {
          'web-mode': langs.vue().language.parser,
          java: langs.java().language.parser,
          'c++': langs.cpp().language.parser,
          c: langs.cpp().language.parser,
          cpp: langs.cpp().language.parser,
          rust: langs.rust().language.parser,
          javascript: langs.javascript().language.parser,
          js: langs.javascript().language.parser,
          typescript: langs.typescript().language.parser,
          ts: langs.typescript().language.parser,
          json: langs.json().language.parser,
          clojure: langs.clojure().language.parser,
          'common-lisp': langs.commonLisp().parser,
          css: langs.css().language.parser,
          dart: langs.dart().parser,
          go: langs.go().parser,
          html: langs.html().language.parser,
          kotlin: langs.kotlin().parser,
          mysql: langs.mysql().language.parser,
          csharp: langs.csharp().language.parser,
          r: langs.r().parser,
          ruby: langs.ruby().parser,
          sass: langs.sass().language.parser,
          scala: langs.scala().parser,
          shell: langs.shell().parser,
          sql: langs.sql().language.parser,
          toml: langs.toml().parser,
          dockerfile: langs.dockerfile().parser,
          php: langs.php().language.parser,
          python: langs.python().language.parser,
          angular: langs.angular().language.parser,
          vue: langs.vue().language.parser,
        },
      }),
      highlightActiveLine(),
      minimalSetup,
      bracketMatching(),
      indentOnInput(),
      closeBrackets(),
      rectangularSelection(),
      newOrgModeDecorationPlugin(vueInstance, () => orgNode),
      EditorView.lineWrapping,
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.docChanged) {
          setText(v.state.doc.toString());
        }
      }),
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
  () => {
    if (!editor.value || props.modelValue === text.value) {
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

.org-link-url {
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

.CodeMirror div.CodeMirror-cursor {
  border-left: 1px solid purple;
}

.cm-focused {
  outline: none !important;
}

.org-property-drawer {
  color: var(--cyan);
}

/* TODO: feature/codemirror change font style for editor */
.cm-line {
  font-size: var(--paragraph-font-size);
  font-family: var(--editor-font-family-main);
}

.cm-content,
.cm-activeLine.cm-line {
  caret-color: var(--fg) !important;
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
  .org-link-url {
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
  .org-quote-block:not(.org-keyword):first-child {
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
</style>
