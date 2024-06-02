<template>
  <div ref="scrollTarget" class="scroll-container">
    <q-page :style-fn="resetPageMinHeight" class="center-container">
      <note-list
        :selectable="true"
        :limit="limit"
        :offset="offset"
        :total="notesStore.total"
        :fetch-notes="notesStore.fetchNotes"
        :notes="notesStore.notes"
        :scroll-target="scrollTarget"
      ></note-list>
      <mode-line v-if="isModeLineVisible" :tab-mode="false">
        <template #left>
          <q-checkbox
            style="margin-left: -3px"
            :model-value="selectedNotesStore.isAllNotesSelected"
            size="sm"
            @update:model-value="selectedNotesStore.toggleBulkNotesSelection"
          ></q-checkbox>
          <div v-if="selectedNotesStore.selectedNotesIds.length">
            {{ selectedNotesStore.selectedNotesIds.length }}
          </div>
          <q-btn
            v-if="selectedNotesStore.isSomeNotesSelected"
            square
            class="themed-button"
            icon="delete"
            flat
            @click="deleteSelectedNotes"
          />
        </template>
      </mode-line>
    </q-page>
  </div>
</template>

<script lang="ts" setup>
import { resetPageMinHeight } from 'src/tools';
import { useNotesStore } from 'stores/notes';
import { useSelectedNotesStore } from 'stores/selected-notes';
import { useRoute } from 'vue-router';

import { computed, ref, watch } from 'vue';

import NoteList from 'components/NoteList.vue';
import ModeLine from 'components/ui/ModeLine.vue';
import { useSyncStore } from 'src/stores/sync';

const notesStore = useNotesStore();

const route = useRoute();

const scrollTarget = ref<HTMLElement | null>(null);

const setFiltersFromQuery = () => {
  notesStore.setFilters({
    searchText: route.query.search as string,
    userId: route.params.userId as string,
  });
};

const limit = computed(() => notesStore.filters.limit);
const offset = computed(() => notesStore.filters.offset);

const reloadNotes = () => {
  setFiltersFromQuery();
  notesStore.loadNotes();
};

reloadNotes();

watch(
  () => route.params.userId as string,
  () => {
    if (notesStore.filters?.userId == route.params.userId) {
      return;
    }
    reloadNotes();
  }
);

const selectedNotesStore = useSelectedNotesStore();

const syncStore = useSyncStore();
const deleteSelectedNotes = async () => {
  await notesStore.deleteNotes(selectedNotesStore.selectedNotesIds);
  syncStore.markToSync();
  selectedNotesStore.clearSelectedNotes();
};

// const isModeLineVisible = computed(() => notesStore.notes.length);
const isModeLineVisible = false;
</script>

<style lang="scss" scoped>
.scroll-container {
  overflow: auto;
  height: calc(100svh - var(--top-bar-height));
}

.q-page {
  max-height: none;
  height: auto;
}
</style>
