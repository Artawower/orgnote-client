<template>
  <div
    class="q-pa-lg items-start public-notes"
    :class="{
      row: tileView,
      column: !tileView,
    }"
  >
    <!-- TODO: add virtual scroll support for tile view mode-->
    <q-virtual-scroll
      ref="virtualScrollRef"
      :items-size="notesState.notesCount"
      :virtual-scroll-slice-size="notesState.filters?.limit || 10"
      :virtual-scroll-item-size="205"
      :virtual-scroll-slice-ratio-before="1"
      :virtual-scroll-slice-ratio-after="1"
      :items-fn="getPagexNotes"
      scroll-target="body"
      v-slot="{ index }"
      class="full-width"
      style="max-height: cacl(100vh - 66px)"
    >
      <async-public-note-container
        :index="index"
        :offset="notesState.filters?.offset"
      >
        <template v-slot="{ note }">
          <div :class="{ fit: !tileView, 'col-4': tileView }">
            <public-note-view
              :note="note as Note"
              :show-author="!isMyNotePage"
              :selectable="isMyNotePage"
              @selected="(selected) => selectNote(note as Note, selected)"
            ></public-note-view>
          </div>
        </template>
      </async-public-note-container>
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';

import PublicNoteView from './PublicNoteView.vue';
import { useViewStore } from 'src/stores/view';
import AsyncPublicNoteContainer from './AsyncPublicNoteContainer.vue';
import { useRoute, useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'src/stores/notes';
import { Note } from 'src/models';

defineComponent({
  PublicNoteView,
});

const viewStore = useViewStore();

const tileView = computed(() => viewStore.tile);

const router = useRouter();
const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

const virtualScrollRef = ref(null);

const notesState = useNotesStore();

const getRoundedOffset = (from: number) =>
  Math.ceil(from / notesState.filters.limit) * notesState.filters.limit;

const firstTimeScrollInit = ref(false);
const getPagexNotes = (from: number) => {
  firstTimeScrollInit.value = true;

  const offset = getRoundedOffset(from);
  notesState.fetchNotes(offset);
  router.push({
    query: {
      limit: notesState.filters.limit,
      offset,
    },
  });
  return Object.freeze(new Array(notesState.filters.limit).fill(null));
};

const route = useRoute();
const initialOffset = route.query.offset;

onMounted(() => {
  if (!initialOffset) {
    return;
  }
  virtualScrollRef.value.scrollTo(initialOffset);
});

const selectedNotes = ref<Note[]>([]);

const selectNote = (note: Note, selected: boolean) => {
  if (!isMyNotePage.value) {
    return;
  }
  if (selected) {
    selectedNotes.value = [...selectedNotes.value, note];
    return;
  }
  selectedNotes.value = selectedNotes.value.filter((n) => n.id !== note.id);
};
</script>

<style scoped lang="scss">
.public-notes {
  padding-bottom: var(--modeline-height);
}
</style>
