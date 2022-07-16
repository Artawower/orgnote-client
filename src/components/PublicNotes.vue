<template>
  <div
    v-if="props.notes"
    class="q-pa-md items-start q-col-gutter-md"
    :class="{
      row: tileView,
      column: !tileView,
    }"
  >
    <div
      v-for="note of props.notes"
      v-bind:key="note.id"
      :class="{ fit: !tileView, 'col-4': tileView }"
    >
      <public-note-view :note="note"></public-note-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue';

import { Note } from 'second-brain-parser/dist/parser/models';
import PublicNoteView from './PublicNoteView.vue';
import { useViewStore } from 'src/stores/view';

defineComponent({
  PublicNoteView,
});

const viewStore = useViewStore();

const tileView = computed(() => viewStore.tile);

interface Props {
  notes?: Note[];
}
const props = defineProps<Props>();
</script>

<style scoped></style>
