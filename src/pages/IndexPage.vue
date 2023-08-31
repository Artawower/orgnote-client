<template>
  <div class="container content">
    <note-list ref="publicNotesRef"></note-list>
    <mode-line v-if="isModeLineVisible" :tabMode="false">
      <template v-if="isMyNotesPage" v-slot:left>
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
import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'stores/notes';
import { useSelectedNotesStore } from 'stores/selected-notes';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const isModeLineVisible = computed(() => notesState.notesPreviews.length);

const router = useRouter();
const isMyNotesPage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);
</script>
