<template>
  <div
    class="editor-wrapper"
    :class="{
      readonly,
      'hide-special-symbols': !editorConfig.showSpecialSymbols,
      'show-property-drawer': editorConfig.showPropertyDrawer,
    }"
  >
    <div id="editor" ref="editorRef" class="rich-editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { api } from 'src/boot/api';
import { setCursorToEOF } from './use-cursor';
import { orgMode } from './org-parser';
import { editorLanguages } from './editor-languages';
import type { OrgNode } from 'org-mode-ast';

defineProps<{
  readonly?: boolean;
}>();

const model = defineModel<string>();
const editorRef = ref<HTMLDivElement>();
const orgNode = shallowRef<OrgNode | null>(null);

const configStore = api.core.useConfig();
const editorConfig = computed(() => configStore.config.editor);

let editorView: EditorView | undefined;
let isInternalUpdate = false;

const handleOrgNodeChanged = (node: OrgNode) => {
  orgNode.value = node;
};

const createUpdateListener = () =>
  EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    isInternalUpdate = true;
    model.value = update.state.doc.toString();
    isInternalUpdate = false;
  });

const createEditorState = (content: string) =>
  EditorState.create({
    doc: content,
    extensions: [
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      createUpdateListener(),
      orgMode({
        wrap: editorLanguages,
        orgAstChanged: handleOrgNodeChanged,
      }),
    ],
  });

const initEditor = () => {
  if (!editorRef.value) return;

  editorView = new EditorView({
    state: createEditorState(model.value ?? ''),
    parent: editorRef.value,
  });

  setCursorToEOF(editorView);
};

const updateEditorContent = (content: string) => {
  if (!editorView) return;

  const currentContent = editorView.state.doc.toString();
  if (currentContent === content) return;

  editorView.dispatch({
    changes: {
      from: 0,
      to: currentContent.length,
      insert: content,
    },
  });
};

onMounted(initEditor);

onUnmounted(() => {
  editorView?.destroy();
});

watch(
  () => model.value,
  (newValue) => {
    if (isInternalUpdate) return;
    updateEditorContent(newValue ?? '');
  },
);
</script>

<style lang="scss">
@import './RichEditor.scss';
</style>
