<template>
  <div class="note-view">
    <note-detail :note="note" :org-tree="orgTree"></note-detail>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useNoteEditorStore } from 'src/stores/note-editor';
import NoteDetail from 'src/components/containers/NoteDetail.vue';

const noteEditorStore = useNoteEditorStore();

const { note, orgTree } = storeToRefs(noteEditorStore);
</script>

<style lang="scss">
.note-view {
  max-width: var(--content-max-width, 100%);
  margin: auto;
}
</style>
