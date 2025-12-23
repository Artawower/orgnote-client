<template>
  <div id="editor" ref="editor"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

defineProps<{
  readonly?: boolean;
}>();

const model = defineModel<string>();
const editor = ref<HTMLDivElement>();

let editorView: EditorView;

const getEditorState = () =>
  EditorState.create({
    doc: model.value,
  });

const initEditor = () => {
  editorView?.destroy();

  editorView = new EditorView({
    state: getEditorState(),
    parent: editor.value,
  });
};

onMounted(() => initEditor());

watch(() => model.value, initEditor);
</script>
