<template>
  <h1>Raw template</h1>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useNoteEditorStore } from 'src/stores/note-editor';

const notEditorStore = useNoteEditorStore();

const { noteText, editedOrgData } = storeToRefs(notEditorStore);
</script>
