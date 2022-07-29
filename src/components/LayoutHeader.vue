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

      <q-icon name="search" size="2rem" class="cursor-pointer search" />
      <q-icon
        v-if="isListPage || isMyNotePage"
        @click="toggleTile"
        :name="isTile ? 'format_list_bulleted' : 'grid_view'"
        size="2rem"
        class="tile-mode-btn cursor-pointer"
      />
      <q-icon
        @click="toggleDarkMode"
        name="brightness_4"
        size="2rem"
        class="dark-mode-btn cursor-pointer"
      />
      <q-icon
        v-if="isViewDetailPage"
        @click="toggleCollapse"
        size="2rem"
        :name="isExpanded ? 'unfold_less' : 'unfold_more'"
        class="cursor-pointer fold-btn"
      ></q-icon>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { MAIN_PAGE_ROUTE, RouteNames } from 'src/router/routes';
import { useViewStore } from 'src/stores/view';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();

const emits = defineEmits<{
  (e: 'leftPanelToggled'): void;
}>();

const toggleDarkMode = () => {
  $q.dark.set(!$q.dark.isActive);
};

const router = useRouter();
const isViewDetailPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteView
);
const isListPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteList
);
const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

const viewStore = useViewStore();
const isExpanded = computed(() => viewStore.someNodeVisible);
const isTile = computed(() => viewStore.tile);

const toggleTile = () => {
  viewStore.toggleTile();
};
const toggleCollapse = () => {
  viewStore.setCollapseStatusForAllNodes(!isExpanded.value);
};

const goToMainPage = () => router.push({ path: MAIN_PAGE_ROUTE.path });
</script>

<style lang="scss">
.dark-header {
  background: $dark-smog !important;
}

.tile-mode-btn {
  margin-right: 1rem;
}

.fold-btn,
.search {
  margin-right: 1rem;
}

.header-content {
  max-width: 1066px;
  margin: auto;
}
</style>
