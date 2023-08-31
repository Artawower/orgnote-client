<template>
  <template v-if="note">
    <slot :note="note"></slot>
  </template>
</template>

<script lang="ts" setup>
import { useNotesStore } from 'src/stores/notes';
import { computed } from 'vue';

const props = defineProps<{
  index: number;
  offset: number;
}>();

const notesStore = useNotesStore();

const note = computed(() => {
  const { index } = props;

  const note = notesStore.notesPreviews[index];
  return note;
});
</script>
