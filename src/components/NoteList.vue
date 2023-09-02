<template>
  <div
    class="q-pa-lg items-start public-notes"
    :class="{
      row: tileView,
      column: !tileView,
    }"
  >
    <q-virtual-scroll
      ref="virtualScrollRef"
      :items-size="total"
      :virtual-scroll-slice-size="limit || 10"
      :virtual-scroll-item-size="230"
      :virtual-scroll-slice-ratio-before="1"
      :virtual-scroll-slice-ratio-after="1"
      :items-fn="getPagedNotes"
      scroll-target="body"
      v-slot="{ index }"
      class="full-width"
      style="max-height: cacl(100vh - 66px)"
    >
      <async-public-note-container
        :note-list="notes"
        :index="index"
        :offset="offset"
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

import PublicNotePreview from './PublicNotePreview.vue';
import { useViewStore } from 'src/stores/view';
import AsyncPublicNoteContainer from './AsyncPublicNoteContainer.vue';
import { useRoute, useRouter } from 'vue-router';
import { Note, NotePreview } from 'src/models';

defineComponent({
  PublicNotePreview,
});

const props = defineProps<{
  selectable: boolean;
  limit: number;
  offset: number;
  total: number;
  notes: (Note | NotePreview)[];
  fetchNotes: (offset: number) => void;
}>();

const selectable = toRef(props, 'selectable');
const limit = toRef(props, 'limit');
const offset = toRef(props, 'offset');
const total = toRef(props, 'total');
const notes = toRef(props, 'notes');

const viewStore = useViewStore();

const tileView = computed(() => viewStore.tile);

const router = useRouter();

const virtualScrollRef = ref(null);

const getRoundedOffset = (from: number) =>
  Math.ceil(from / limit.value) * limit.value;

const firstTimeScrollInit = ref(false);
const getPagedNotes = (from: number) => {
  firstTimeScrollInit.value = true;

  const offset = getRoundedOffset(from);
  console.log(`✎: [scroll][${new Date().toString()}] FETCH NOTES`);

  props.fetchNotes(offset);
  router.push({
    query: {
      limit: limit.value,
      offset,
    },
  });
  // console.log(`✎: [scroll][${new Date().toString()}] limit.value`, limit.value);
  return Object.freeze(new Array(limit.value).fill(null));
};

const route = useRoute();
const initialOffset = +route.query.offset;
console.log('✎: [line 100][scroll] initialOffset: ', initialOffset);

let alreadyScrolled = false;

const scrollAfterInit = () => {
  console.log('✎: [line 108][scroll] initialOffset: ', initialOffset);
  if (
    alreadyScrolled ||
    !initialOffset ||
    !virtualScrollRef.value ||
    !notes.value.length
  ) {
    return;
  }
  console.log(
    '✎: [line 110][scroll] virtualScrollRef.value: ',
    virtualScrollRef.value
  );
  props.fetchNotes(initialOffset - limit.value);
  setTimeout(() => {
    console.log(
      `✎: [scroll][${new Date().toString()}] SCROLL TO`,
      initialOffset - limit.value
    );
    virtualScrollRef.value.scrollTo(initialOffset - limit.value);
  }, 2500);
  alreadyScrolled = true;
};

onMounted(() => {
  scrollAfterInit();
});

watch(
  () => notes.value,
  () => scrollAfterInit()
);

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
