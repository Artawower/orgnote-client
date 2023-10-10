<template>
  <note-detail :note="note" :org-tree="orgTree"></note-detail>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useNoteEditorStore } from 'src/stores/note-editor';

import NoteDetail from 'src/components/containers/NoteDetail.vue';

const noteEditorStore = useNoteEditorStore();

const { note, orgTree } = storeToRefs(noteEditorStore);
</script>
