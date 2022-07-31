<template>
  <q-page padding>
    <public-notes :notes="notesState.notes"></public-notes>
  </q-page>
</template>

<script lang="ts" setup>
import PublicNotes from 'components/PublicNotes.vue';
import { useNotesStore } from 'stores/notes';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const notesState = useNotesStore();

const route = useRoute();

const userId = route.params.userId as string;

notesState.setFilters({ searchText: route.query.search as string });

watch(
  () => route.params.userId as string,
  (userId) => {
    notesState.loadNotes(userId);
  }
);
notesState.loadNotes(userId);
</script>
