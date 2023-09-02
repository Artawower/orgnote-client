<template>
  <div class="container content">
    <note-list
      :selectable="true"
      :limit="limit"
      :offset="offset"
      :total="notesStore.total"
      :fetch-notes="notesStore.fetchNotes"
      :notes="notesStore.notes"
      ref="publicNotesRef"
    ></note-list>
    <mode-line v-if="isModeLineVisible" :tabMode="false">
      <template v-slot:left>
        <q-checkbox
          class="q-pl-sm"
          :modelValue="selectedNotesStore.isAllNotesSelected"
          size="sm"
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
import NoteList from 'components/NoteList.vue';
import ModeLine from 'components/ui/ModeLine.vue';
import { useNotesStore } from 'stores/notes';
import { useSelectedNotesStore } from 'stores/selected-notes';
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const notesStore = useNotesStore();

const route = useRoute();

const setFiltersFromQuery = () => {
  notesStore.setFilters({
    searchText: route.query.search as string,
    userId: route.params.userId as string,
    limit: +(route.query.limit as string),
    offset: +(route.query.offset as string),
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

const deleteSelectedNotes = () => {
  notesStore.deleteNotes(selectedNotesStore.selectedNotesIds);
  selectedNotesStore.clearSelectedNotes();
};

const isModeLineVisible = computed(() => notesStore.notes.length);
</script>