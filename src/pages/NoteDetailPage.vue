<template>
  <q-page padding class="note-view">
    <author-info
      v-if="selectedNote"
      :author="selectedNote?.author"
      class="q-pb-lg"
    >
      ></author-info
    >
    <h1>{{ selectedNote?.meta.title }}</h1>
    <div class="q-pt-md">
      <file-path
        v-if="selectedNote"
        :file-path="selectedNote.filePath"
      ></file-path>
    </div>
    <h4 class="note-description">{{ selectedNote?.meta.description }}</h4>
    <q-img
      v-if="selectedNote?.meta.previewImg"
      class="pointer rounded-borders"
      :src="buildMediaFilePath((selectedNote.meta as any).previewImg)"
    />
    <div class="note-content">
      <content-renderer
        v-if="selectedNote?.content"
        :node="selectedNote?.content"
      ></content-renderer>
    </div>
    <note-footer>
      <tag-list :tags="selectedNote?.meta?.fileTags" />
    </note-footer>
    <mode-line v-if="selectedNote?.isMyNote">
      <q-route-tab
        :to="{ name: RouteNames.EditNote, params: { id: selectedNote?.id } }"
        icon="edit"
      >
      </q-route-tab>
    </mode-line>
  </q-page>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useNotesStore } from 'stores/notes';
import { buildMediaFilePath } from 'src/tools';

import ContentRenderer from 'components/ContentRenderer.vue';
import NoteFooter from 'components/NoteFooter.vue';
import TagList from 'components/TagList.vue';
import AuthorInfo from 'components/containers/AuthorInfo.vue';
import FilePath from 'components/containers/FilePath.vue';
import ModeLine from 'src/components/ui/ModeLine.vue';
import { RouteNames } from 'src/router/routes';

const noteStore = useNotesStore();
const route = useRoute();

const { selectedNote } = storeToRefs(noteStore);

if (!selectedNote?.value && route.params.id) {
  noteStore.selectNoteById(route.params.id as string);
}

watch(
  () => route.params.id,
  (id) => id && noteStore.selectNoteById(id as string)
);
</script>

<style lang="scss" scoped>
.note-description {
  color: var(--description-font-color);
  font-style: var(--description-font-style);
  padding: var(--description-padding, 16px 0px);
}
</style>
