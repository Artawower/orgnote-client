<template>
  <div>
    <h1>{{ selectedNote?.meta.title }}</h1>
    <content-renderer :content="selectedNote?.content"></content-renderer>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useNotesStore } from 'stores/notes';
import { storeToRefs } from 'pinia';

import ContentRenderer from 'components/ContentRenderer.vue';

defineComponent({
  ContentRenderer,
});

const noteStore = useNotesStore();
const route = useRoute();

const { selectedNote } = storeToRefs(noteStore);

if (!selectedNote?.value && route.params.id) {
  noteStore.selectNoteById(route.params.id as string);
}

watch(
  () => route.params.id,
  (id) => {
    noteStore.selectNoteById(id as string);
  }
);
</script>

<style scoped></style>
