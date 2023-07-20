<template>
  <org-editor v-model="noteText"></org-editor>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import OrgEditor from 'src/components/OrgEditor.vue';
import { useNoteEditorStore } from 'src/stores/note-editor';

const noteEditorStore = useNoteEditorStore();
const { noteText } = storeToRefs(noteEditorStore);
</script>
