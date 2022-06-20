<template>
  <q-page padding>
    <h1>{{ selectedNote?.meta.title }}</h1>
    <h4 class="note-description">{{ selectedNote?.meta.description }}</h4>
    <content-renderer :content="selectedNote?.content"></content-renderer>
    <note-footer>
      <div v-if="selectedNote?.meta?.tags" class="tags-wrapper">
        <q-badge
          v-for="tag in selectedNote?.meta?.tags"
          :key="tag"
          @click="searchByTag(tag)"
          rounded
          outline
          color="primary"
          class="tag"
          :label="tag"
        />
      </div>
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

const searchByTag = (tag: string) => {
  console.log(tag);
  throw new Error('Method not implemented.');
};
</script>

<style lang="scss" scoped>
.note-description {
  color: $smog;
  /* TODO: master  choose font for cursive*/
  font-style: italic;
}
.tag {
  cursor: pointer;
  &:not(:first-child) {
    margin-left: 0.5rem;
  }
}
</style>
