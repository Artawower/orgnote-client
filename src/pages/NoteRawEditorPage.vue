<template>
  <raw-editor
    v-model="initialNoteText"
    @data-updated="dataUpdated"
    @change-cursor-position="noteEditorStore.cursorPosition = $event"
    @focus-changed="toolbarStore.showToolbar = !$event"
    @init="setEditorView"
  ></raw-editor>
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<script lang="ts" setup>
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { OrgNode } from 'org-mode-ast';
import { useNoteEditorStore, useToolbarStore } from 'src/stores';
import { EditorView } from 'codemirror';
import { debounce } from 'src/tools';

const noteEditorStore = useNoteEditorStore();
const toolbarStore = useToolbarStore();

const initialNoteText = ref<string>(noteEditorStore.noteText);

const updateStoreDate = debounce(noteEditorStore.setNoteData, 100);

const dataUpdated = ([text, orgNode]: [string, OrgNode]) => {
  updateStoreDate(text, orgNode);
};

const setEditorView = ({ view }: { view: EditorView }) => {
  noteEditorStore.editorView = view;
};

watch(
  () => noteEditorStore.noteText,
  (curr, prev) => {
    if (curr === prev) {
      return;
    }
    initialNoteText.value = curr;
  }
);

onBeforeUnmount(() => {
  noteEditorStore.editorView = null;
});
</script>
