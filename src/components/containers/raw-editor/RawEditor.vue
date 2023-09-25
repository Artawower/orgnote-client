<template>
  <div class="editor-wrapper">
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate, highlightActiveLine } from '@codemirror/view';
import { parser as jsParser } from '@lezer/javascript';
import { parser as pyParser } from '@lezer/python';
import { OrgNode } from 'org-mode-ast';
import { orgMode } from 'src/tools/cm-org-language';

import { onMounted, ref, toRef } from 'vue';

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
const initEditor = () => {
  let startState = EditorState.create({
    doc: text.value,
    extensions: [
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) => (orgNode = updatedOrgNode),
        wrap: {
          python: pyParser,
          javascript: jsParser,
          js: jsParser,
          typescript: jsParser.configure({ dialect: 'ts' }),
          ts: jsParser.configure({ dialect: 'ts' }),
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

  new EditorView({
    state: startState,
    parent: editor.value,
  });
};

onMounted(() => initEditor());
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

.org-operator {
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

.cm-content {
  caret-color: var(--fg) !important;
}

.org-keyword,
.cm-line-comment,
.org-block-property,
.org-comment {
  color: var(--fg-alt);
}

.org-src-language {
  color: var(--yellow);
}

.cm-string,
.cm-regexp {
  color: var(--green);
}

.cm-definition-keyword,
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

.cm-property-name {
  color: var(--blue);
}

.cm-activeLine {
  background-color: unset !important;

  .org-operator {
    display: inline !important;
  }
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
