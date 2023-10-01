<template>Not implemented</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useNoteEditorStore } from 'src/stores/note-editor';

const noteEditorStore = useNoteEditorStore();
const { noteText } = storeToRefs(noteEditorStore);
</script>
