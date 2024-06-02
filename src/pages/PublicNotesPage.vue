<template>
  <div ref="scrollTarget" class="scroll-container">
    <q-page :style-fn="resetPageMinHeight" class="center-container">
      <div class="container page-container">
        <note-list
          :selectable="false"
          :notes="publicNotesStore.notes"
          :limit="limit"
          :offset="offset"
          :total="publicNotesStore.total"
          :fetch-notes="publicNotesStore.fetchNotes"
          :scroll-target="scrollTarget"
          :height="254"
          ref="publicNotesRef"
        ></note-list>
      </div>
    </q-page>
  </div>
</template>

<script lang="ts" setup>
import { resetPageMinHeight } from 'src/tools';
import { useRoute } from 'vue-router';

import { computed, ref } from 'vue';

import NoteList from 'components/NoteList.vue';
import { usePublicNotesStore } from 'src/stores/public-notes';

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

const scrollTarget = ref<HTMLElement | null>(null);

reloadNotes();
</script>

<style lang="scss" scoped>
.scroll-container {
  overflow: auto;
  height: calc(100svh - var(--top-bar-height));
}
</style>
