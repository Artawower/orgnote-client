<template>
  <raw-editor
    v-if="note"
    v-model="note.content"
    :readonly="true"
    :config="readonlyConfig"
    @init="setEditorView"
  ></raw-editor>
</template>

<script lang="ts" setup>
import { OrgNoteConfig } from 'src/api';

import { toRef } from 'vue';

import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { EditorView } from '@codemirror/view';
import { Note } from 'orgnote-api';

const props = defineProps<{
  note?: Note;
}>();

const note = toRef(props, 'note');

const readonlyConfig: OrgNoteConfig['editor'] = {
  showSpecialSymbols: false,
  showPropertyDrawer: false,
};

const noteEditorStore = useNoteEditorStore();

const setEditorView = ({ view }: { view: EditorView }) => {
  noteEditorStore.editorView = view;
};
</script>

<style lang="scss" scoped>
.note-description {
  color: var(--description-font-color);
  font-style: var(--description-font-style);
  padding: var(--description-padding, 16px 0px);
}
</style>
