<template>
  <q-page padding class="note-view">
    <author-info
      v-if="selectedNote"
      :author="selectedNote?.author"
    ></author-info>
    <h1>{{ selectedNote?.meta.title }}</h1>
    <h4 class="note-description">{{ selectedNote?.meta.description }}</h4>
    <q-img
      v-if="selectedNote?.meta.previewImg"
      class="pointer rounded-borders"
      :src="buildMediaFilePath((selectedNote.meta as any).previewImg)"
    />
    <div class="note-content">
      <content-renderer :node="selectedNote?.content"></content-renderer>
    </div>
    <note-footer>
      <tag-list :tags="selectedNote?.meta?.fileTags" />
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
import AuthorInfo from './AuthorInfo.vue';
import { buildMediaFilePath } from 'src/tools';

const noteStore = useNotesStore();
const route = useRoute();

const { selectedNote } = storeToRefs(noteStore);
console.log(selectedNote.value);

if (!selectedNote?.value && route.params.id) {
  noteStore.selectNoteById(route.params.id as string);
}

watch(
  () => route.params.id,
  (id) => {
    if (!id) {
      return;
    }
    noteStore.selectNoteById(id as string);
  }
);
</script>

<style lang="scss" scoped>
.note-description {
  color: var(--description-font-color);
  /* TODO: master  choose font for cursive*/
  font-style: var(--description-font-style);
}
</style>
