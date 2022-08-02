<template>
  <div
    class="q-pa-md items-start q-col-gutter-md"
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
              :note="note"
              :show-author="!isMyNotePage"
            ></public-note-view>
          </div>
        </template>
      </async-public-note-container>
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUpdated,
  ref,
  watch,
} from 'vue';

import PublicNoteView from './PublicNoteView.vue';
import { useViewStore } from 'src/stores/view';
import AsyncPublicNoteContainer from './AsyncPublicNoteContainer.vue';
import { useRoute, useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'src/stores/notes';

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
const getPagexNotes = (from: number, _: number) => {
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
const scrollByOffset = () => {
  virtualScrollRef.value.scrollTo(initialOffset);
};

onMounted(() => {
  if (!initialOffset) {
    return;
  }
  // FIXME: DIRTY HACK, scrollTo doesn't work after onUpdate hook.
  // Investigate and fix.
  setTimeout(() => {
    scrollByOffset();
  }, 200);
});
</script>

<style scoped lang="scss">
.notes-wrapper {
  position: relative;
  max-height: calc(100vh - 66px);
  height: calc(100vh - 66px);
  overflow-y: auto;
}
</style>
