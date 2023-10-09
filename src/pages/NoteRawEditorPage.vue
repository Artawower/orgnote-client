<template>
  <raw-editor
    v-model="initialNoteText"
    @data-updated="dataUpdated"
    @change-cursor-position="noteEditorStore.cursorPosition = $event"
    @focus-changed="toolbarStore.showToolbar = !$event"
    @init="setEditorView"
  ></raw-editor>
  <editor-actions-toolbar
    v-if="$q.screen.lt.sm && !toolbarStore.showToolbar && keyboardOpened"
  />
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<script lang="ts" setup>
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import EditorActionsToolbar from 'src/components/containers/EditorActionsToolbar.vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { OrgNode } from 'org-mode-ast';
import { useNoteEditorStore, useToolbarStore } from 'src/stores';
import { useEditorActions } from 'src/hooks/editor-actions-hook';
import { EditorView } from 'codemirror';
import { onMobileViewportChanged } from 'src/hooks';

const noteEditorStore = useNoteEditorStore();
const toolbarStore = useToolbarStore();

const initialNoteText = ref<string>(noteEditorStore.noteText);

const dataUpdated = ([text, orgNode]: [string, OrgNode]) => {
  noteEditorStore.setNoteData(text, orgNode);
};

const setEditorView = ({ view }: { view: EditorView }) => {
  noteEditorStore.editorView = view;
};

watch(
  () => noteEditorStore.noteText,
  (val) => {
    if (val === initialNoteText.value) {
      return;
    }
    initialNoteText.value = val;
  }
);

const { keyboardOpened } = onMobileViewportChanged();

useEditorActions();

onBeforeUnmount(() => {
  noteEditorStore.editorView = null;
});
</script>
