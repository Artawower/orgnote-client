<template>
  <div class="note-view">
    <content-renderer v-if="noteOrgData" :node="noteOrgData"></content-renderer>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import ContentRenderer from 'src/components/ContentRenderer.vue';
import { useNoteEditorStore } from 'src/stores/note-editor';

const noteEditorStore = useNoteEditorStore();

const { noteOrgData } = storeToRefs(noteEditorStore);
</script>

<style lang="scss">
.note-view {
  max-width: var(--content-max-width, 100%);
  margin: auto;
}
</style>
