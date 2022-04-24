<template>
  <h1>{{ selectedNote?.meta.title }}</h1>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useNotesStore } from 'stores/notes';
import { storeToRefs } from 'pinia';

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
