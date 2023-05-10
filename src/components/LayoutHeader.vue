<template>
  <q-header
    :class="[
      $q.dark.isActive ? 'dark-header text-grey-12' : 'bg-white text-grey-10',
    ]"
  >
    <q-toolbar class="header-content">
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="emits('leftPanelToggled')"
      />

      <q-toolbar-title @click="goToMainPage" class="cursor-pointer"
        >Second brain</q-toolbar-title
      >
      <!-- TODO: master  remove highlighting after focus -->
      <q-input
        dense
        rounded
        outlined
        debounce="300"
        borderless
        v-model="search"
        :placeholder="$t('search')"
        class="q-mr-md"
      >
        <template v-slot:prepend>
          <q-icon name="search" size="1.5rem" class="cursor-pointer search" />
        </template>
        <template v-if="search" v-slot:append>
          <q-icon
            name="close"
            @click.stop.prevent="search = null"
            class="cursor-pointer"
          />
        </template>
      </q-input>

      <q-icon
        v-if="isListPage || isMyNotePage"
        @click="toggleTile"
        :name="isTile ? 'format_list_bulleted' : 'grid_view'"
        size="2rem"
        class="tile-mode-btn cursor-pointer"
      />
      <!-- <q-icon
        v-if="isNoteDetailPage"
        @click="toggleCollapse"
        size="2rem"
        :name="isExpanded ? 'unfold_less' : 'unfold_more'"
        class="cursor-pointer fold-btn"
      ></q-icon> -->
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
// TODO: master DELETE THIS COMPONENT!
import { useQuasar } from 'quasar';
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import { useNotesStore, DEFAULT_LIMIT, DEFAULT_OFFSET } from 'src/stores/notes';
import { useViewStore } from 'src/stores/view';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const $q = useQuasar();

const emits = defineEmits<{
  (e: 'leftPanelToggled'): void;
}>();

const router = useRouter();
const isNoteDetailPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteDetail
);
const isListPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteList
);
const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

const viewStore = useViewStore();
// const isExpanded = computed(() => viewStore.someNodeVisible);
const isTile = computed(() => viewStore.tile);

const toggleTile = () => {
  viewStore.toggleTile();
};
// TODO: master change
// const toggleCollapse = () => {
//   viewStore.setCollapseStatusForAllNodes(!isExpanded.value);
// };
//
const route = useRoute();

const search = ref<string>((route.query.search as string) || '');

const notesStore = useNotesStore();
const authStore = useAuthStore();

const goToMainPage = () => {
  router.push({
    name: RouteNames.UserNotes,
    params: { userId: authStore.user.id },
  });
};

const searchNotes = () => {
  notesStore.setFilters({ searchText: search.value });
  notesStore.loadNotes();
};

watch(
  () => notesStore.filters.searchText,
  (v) => (search.value = v)
);

watch(
  () => search.value,
  (q) => {
    router.push({
      name: isNoteDetailPage.value ? RouteNames.NoteList : route.name,
      query: {
        search: q,
      },
    });
    searchNotes();
  }
);
</script>

<style lang="scss">
.dark-header {
  background: var(--secondary-background) !important;
}

.tile-mode-btn {
  margin-right: 1rem;
}

.fold-btn {
  margin-right: 1rem;
}

.header-content {
  max-width: 1066px;
  margin: auto;
}
.q-field--highlighted {
  .q-field__control {
    color: inherit;
  }
}
</style>
