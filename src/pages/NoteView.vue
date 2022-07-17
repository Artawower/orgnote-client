<template>
  <q-page padding class="note-view">
    <h1>{{ selectedNote?.meta.title }}</h1>
    <h4 class="note-description">{{ selectedNote?.meta.description }}</h4>
    <content-renderer :content="selectedNote?.content"></content-renderer>
    <note-footer>
      <tag-list :tags="selectedNote?.meta?.tags" />
    </note-footer>
  </q-page>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useNotesStore } from 'stores/notes';
import { storeToRefs } from 'pinia';
import ContentRenderer from 'components/ContentRenderer.vue';
import NoteFooter from 'components/NoteFooter.vue';
import TagList from 'components/TagList.vue';
import { useViewStore } from 'src/stores/view';

const noteStore = useNotesStore();
const route = useRoute();

const { selectedNote } = storeToRefs(noteStore);

if (!selectedNote?.value && route.params.id) {
  noteStore.selectNoteById(route.params.id as string);
}

const viewStore = useViewStore();

watch(
  () => route.params.id,
  (id) => {
    noteStore.selectNoteById(id as string);
    viewStore.resetView();
  }
);
</script>

<style lang="scss" scoped>
.note-description {
  color: $smog;
  /* TODO: master  choose font for cursive*/
  font-style: italic;
}
</style>
