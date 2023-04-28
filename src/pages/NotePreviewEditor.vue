<template>
  <div class="note-view">
    <div class="note-content">
      <content-renderer
        v-if="noteOrgData"
        :node="noteOrgData"
      ></content-renderer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import ContentRenderer from 'src/components/ContentRenderer.vue';
import { useNoteEditorStore } from 'src/stores/note-editor';

const noteEditorStore = useNoteEditorStore();

const { noteOrgData } = storeToRefs(noteEditorStore);
</script>
