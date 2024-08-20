<template>
  <note-detail :note-text="noteText" />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useNoteEditorStore } from 'src/stores/note-editor';

import NoteDetail from 'src/components/containers/NoteDetail.vue';

const noteEditorStore = useNoteEditorStore();

const { noteText } = storeToRefs(noteEditorStore);
</script>
