<template>
  <div v-if="props.notes">
    <div v-for="note of props.notes" v-bind:key="note.id">
      <public-note-view :note="note"></public-note-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, defineProps } from 'vue';

import { Note } from 'second-brain-parser/dist/parser/models';
import PublicNoteView from './PublicNoteView.vue';

defineComponent({
  PublicNoteView,
});

interface Props {
  notes?: Note[];
}
const props = defineProps<Props>();
</script>

<style scoped></style>
