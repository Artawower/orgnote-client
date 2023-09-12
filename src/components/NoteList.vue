<template>
  <div
    class="q-pa-lg items-start public-notes"
    :class="{
      row: tileView,
      column: !tileView,
    }"
  >
    <q-virtual-scroll
      v-if="scrollTarget"
      ref="virtualScrollRef"
      @virtual-scroll="onVirtualScroll"
      :items-size="total"
      :virtual-scroll-slice-size="(limit || 10) * 3"
      :virtual-scroll-item-size="230"
      :items-fn="getPagedNotes"
      :scroll-target="scrollTarget"
      v-slot="{ index }"
      class="full-width"
      style="max-height: cacl(100vh - 66px)"
    >
      <async-public-note-container
        :note-list="notes"
        :index="index"
        :height="230"
      >
        <template v-slot="{ note }">
          <div :class="{ fit: !tileView, 'col-4': tileView }">
            <public-note-preview
              :note-preview="note as NotePreview"
              :show-author="!selectable"
              :selectable="selectable"
              :height="230"
              @selected="(selected) => selectNote(note as Note, selected)"
            ></public-note-preview>
          </div>
        </template>
      </async-public-note-container>
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, toRef, watch } from 'vue';

import PublicNotePreview from './containers/PublicNotePreview.vue';
import { useViewStore } from 'src/stores/view';
import AsyncPublicNoteContainer from './AsyncPublicNoteContainer.vue';
import { useRoute, useRouter } from 'vue-router';
import { Note, NotePreview } from 'src/models';
import { debounce } from 'src/tools';
import { QVirtualScroll } from 'quasar';

defineComponent({
  PublicNotePreview,
});

const props = defineProps<{
  selectable: boolean;
  limit: number;
  offset: number;
  total: number;
  notes: (Note | NotePreview)[];
  fetchNotes: (offset: number, limit: number) => Promise<void>;
  scrollTarget: Element;
}>();

const selectable = toRef(props, 'selectable');
const limit = toRef(props, 'limit');
const total = toRef(props, 'total');
const notes = toRef(props, 'notes');

const viewStore = useViewStore();

const tileView = computed(() => viewStore.tile);

const router = useRouter();

const virtualScrollRef = ref<QVirtualScroll>(null);
const route = useRoute();
const fetchNotesWithDebounce = debounce(props.fetchNotes, 300);

const lastFrom = ref(0);

watch(
  () => lastFrom.value,
  (from) => router.replace({ query: { from } })
);

const initialFrom = +route.query.from || 0;

const getPagedNotes = (from: number, size: number) => {
  const fakeRows = Object.freeze(new Array(size).fill(null));
  fetchNotesWithDebounce(from, size);
  return fakeRows;
};

let alreadyScrolled = false;

const scrollAfterInit = () => {
  if (
    alreadyScrolled ||
    !initialFrom ||
    !total.value ||
    !virtualScrollRef.value
  ) {
    return;
  }

  setTimeout(() => {
    virtualScrollRef.value.scrollTo(initialFrom, 'start');
  });

  alreadyScrolled = true;
};

const onVirtualScroll = (details: {
  index: number;
  from: number;
  to: number;
  direction: 'increase' | 'decrease';
  ref: QVirtualScroll;
}) => {
  lastFrom.value = details.index;
};

watch([total, virtualScrollRef], () => scrollAfterInit());

onMounted(() => {
  scrollAfterInit();
});

const selectedNotes = ref<Note[]>([]);

const selectNote = (note: Note, selected: boolean) => {
  if (!selectable.value) {
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
