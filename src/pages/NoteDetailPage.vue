<template>
  <q-page padding class="note-view height-auto with-modeline">
    <author-info
      v-if="currentNote && !currentNote?.isMyNote"
      :author="currentNote?.author"
      class="q-pb-lg"
    >
      ></author-info
    >
    <note-detail :note="currentNote as Note"></note-detail>
    <mode-line v-if="currentNote?.isMyNote">
      <q-route-tab
        :to="{ name: RouteNames.EditNote, params: { id: currentNote?.id } }"
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

import AuthorInfo from 'components/containers/AuthorInfo.vue';
import ModeLine from 'src/components/ui/ModeLine.vue';
import NoteDetail from 'src/components/containers/NoteDetail.vue';
import { RouteNames } from 'src/router/routes';
import { Note } from 'src/models';
import { useCurrentNoteStore } from 'src/stores/current-note';

const route = useRoute();

const currentNoteStore = useCurrentNoteStore();

const { currentNote } = storeToRefs(currentNoteStore);

if (!currentNote?.value && route.params.id) {
  currentNoteStore.selectNoteById(route.params.id as string);
}

watch(
  () => route.params.id,
  (id) => id && currentNoteStore.selectNoteById(route.params.id as string)
);
</script>
