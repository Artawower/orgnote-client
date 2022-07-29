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
      <public-note-view
        :note="note"
        :show-author="!isMyNotePage"
      ></public-note-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue';

import PublicNoteView from './PublicNoteView.vue';
import { useViewStore } from 'src/stores/view';
import { Note } from 'src/models';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';

defineComponent({
  PublicNoteView,
});

const viewStore = useViewStore();

const tileView = computed(() => viewStore.tile);

interface Props {
  notes?: Note[];
}
const props = defineProps<Props>();

const router = useRouter();
const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);
</script>

<style scoped></style>
