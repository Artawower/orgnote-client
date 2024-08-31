<template>
  <raw-editor
    v-if="noteText"
    :modelValue="noteText"
    :readonly="true"
    :config="readonlyConfig"
    @init="setEditorView"
  ></raw-editor>
</template>

<script lang="ts" setup>
import { OrgNoteConfig } from 'src/api';
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { EditorView } from '@codemirror/view';

defineProps<{
  noteText?: string;
}>();

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
