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

const setFiltersFromQuery = () => {
  notesState.setFilters({
    searchText: route.query.search as string,
    userId: route.params.userId as string,
  });
};

setFiltersFromQuery();

watch(
  () => route.params.userId as string,
  () => {
    setFiltersFromQuery();
    notesState.loadNotes();
  }
);

notesState.loadNotes();
</script>
