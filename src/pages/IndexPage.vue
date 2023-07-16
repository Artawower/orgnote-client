<template>
  <div class="container content">
    <public-notes ref="publicNotesRef" :notes="notesState.notes"></public-notes>
    <mode-line v-if="isModeLineVisible" :tabMode="false">
      <template v-slot:left>
        <q-checkbox
          :modelValue="selectedNotesStore.isAllNotesSelected"
          @update:model-value="selectedNotesStore.toggleBulkNotesSelection"
        ></q-checkbox>
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
  </div>
</template>

<script lang="ts" setup>
import PublicNotes from 'components/PublicNotes.vue';
import ModeLine from 'components/ui/ModeLine.vue';
import { useNotesStore } from 'stores/notes';
import { useSelectedNotesStore } from 'stores/selected-notes';
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const notesState = useNotesStore();

const route = useRoute();

const setFiltersFromQuery = () => {
  notesState.setFilters({
    searchText: route.query.search as string,
    userId: route.params.userId as string,
    limit: +(route.query.limit as string),
    offset: +(route.query.offset as string),
  });
};

const reloadNotes = () => {
  setFiltersFromQuery();
  notesState.loadNotes();
};

reloadNotes();

watch(
  () => route.params.userId as string,
  () => {
    if (notesState.filters?.userId == route.params.userId) {
      return;
    }
    reloadNotes();
  }
);

const selectedNotesStore = useSelectedNotesStore();

const deleteSelectedNotes = () => {
  notesState.deleteNotes(selectedNotesStore.selectedNotesIds);
  selectedNotesStore.clearSelectedNotes();
};

const isModeLineVisible = computed(() => notesState.notes.length);
</script>
