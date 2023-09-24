<template>
  <div class="editor-wrapper">
    <div id="editor" ref="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { OrgNode, parse } from 'org-mode-ast';
import { orgMode } from 'src/tools/cm-org-language';

import { onMounted, ref, toRef } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: [string, OrgNode?];
    hideSpecialSymbols?: boolean;
  }>(),
  { modelValue: () => [''] }
);

const emits = defineEmits<{
  (e: 'update:modelValue', val: [string, OrgNode]): void;
}>();

// TODO: feature/codemirror move to settings
const hideSpecialSymbols = toRef(props, 'hideSpecialSymbols');

const text = toRef(props.modelValue, 0);
const orgNode = ref<OrgNode>();

const setText = (t: string) => {
  text.value = t;
  emits('update:modelValue', [t, orgNode.value]);
};

const editor = ref<HTMLDivElement>();
const initEditor = () => {
  let startState = EditorState.create({
    doc: text.value,
    extensions: [
      orgMode({
        orgAstChanged: (updatedOrgNode: OrgNode) =>
          (orgNode.value = updatedOrgNode),
      }),
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
  color: red;
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

.org-propertyDrawer {
  color: var(--cyan);
}

/* TODO: feature/codemirror change font style for editor */
.cm-line {
  font-size: var(--paragraph-font-size);
  font-family: var(--editor-font-family-main);
}

.CodeMirror-cursor,
.cm-cursor {
  background-color: red !important;
  color: red !important;
}

.cm-content {
  caret-color: var(--fg) !important;
}
</style>
