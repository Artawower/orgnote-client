<template>
  <q-page padding class="note-view">
    <author-info
      v-if="selectedNote"
      :author="selectedNote?.author"
      class="q-pb-lg"
    >
      ></author-info
    >
    <note-detail :note="selectedNote as Note"></note-detail>
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
import AuthorInfo from 'components/containers/AuthorInfo.vue';
import ModeLine from 'src/components/ui/ModeLine.vue';
import NoteDetail from 'src/components/containers/NoteDetail.vue';
import { RouteNames } from 'src/router/routes';
import { Note } from 'src/models';

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
