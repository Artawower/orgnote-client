<template>
  <div class="container content">
    <note-list
      :selectable="false"
      :notes="publicNotesStore.notes as Note[]"
      :limit="limit"
      :offset="offset"
      :total="publicNotesStore.total"
      :fetch-notes="publicNotesStore.fetchNotes"
      ref="publicNotesRef"
    ></note-list>
  </div>
</template>

<script lang="ts" setup>
import NoteList from 'components/NoteList.vue';
import { Note } from 'src/models';
import { usePublicNotesStore } from 'src/stores';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const publicNotesStore = usePublicNotesStore();

const limit = computed(() => publicNotesStore.filters.limit);
const offset = computed(() => publicNotesStore.filters.offset);

const route = useRoute();

const setFiltersFromQuery = () => {
  publicNotesStore.setFilters({
    searchText: route.query.search as string,
    userId: route.params.userId as string,
    limit: +(route.query.limit as string),
    offset: +(route.query.offset as string),
  });
};

const reloadNotes = () => {
  setFiltersFromQuery();
  publicNotesStore.loadNotes();
};

reloadNotes();
</script>
