<template>
  <div class="note-view">
    <note-detail :note="note as Note"></note-detail>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useNoteEditorStore } from 'src/stores/note-editor';
import NoteDetail from 'src/components/containers/NoteDetail.vue';
import { Note } from 'src/models';

const noteEditorStore = useNoteEditorStore();

const { note } = storeToRefs(noteEditorStore);
</script>

<style lang="scss">
.note-view {
  max-width: var(--content-max-width, 100%);
  margin: auto;
}
</style>
