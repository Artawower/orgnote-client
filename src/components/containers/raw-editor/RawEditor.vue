<template>
  <div class="editor-wrapper">
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate, highlightActiveLine } from '@codemirror/view';
import {
  LanguageName,
  langs,
  loadLanguage,
} from '@uiw/codemirror-extensions-langs';
import { OrgNode } from 'org-mode-ast';
import { orgMode } from 'src/tools/cm-org-language';

import { onMounted, ref, toRef, watch } from 'vue';

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
    modelValue: [string, OrgNode?];
  }>(),
  { modelValue: () => [''] }
);

const emits = defineEmits<{
  (e: 'update:modelValue', val: [string, OrgNode]): void;
}>();

const text = toRef(props.modelValue, 0);
let orgNode: OrgNode;

const setText = (t: string) => {
  text.value = t;
  emits('update:modelValue', [t, orgNode]);
};

const editor = ref<HTMLDivElement>();
let editorView: EditorView;
const initEditor = () => {
  let startState = EditorState.create({
    doc: text.value,
    extensions: [
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) => (orgNode = updatedOrgNode),
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

const setEditorText = (text: string) => {
  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: text,
    },
  });
};

onMounted(() => initEditor());

watch(
  () => props.modelValue,
  () => {
    if (!editor.value || props.modelValue[0] === text.value) {
      return;
    }
    setEditorText(props.modelValue[0]);
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

.org-bold,
.org-italic,
.org-crossed {
  &.org-operator {
    display: none;
  }
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

.cm-content {
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

.org-src-block {
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

  .org-operator {
    display: inline !important;
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

.org-headline-6,
.org-headline-7,
.org-headline-8,
.org-headline-9,
.org-headline-10,
.org-headline-11,
.org-headline-12 {
  font-size: 1rem;
}
</style>
