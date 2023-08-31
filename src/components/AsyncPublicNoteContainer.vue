<template>
  <template v-if="note">
    <slot :note="note"></slot>
  </template>
</template>

<script lang="ts" setup>
import { Note, NotePreview } from 'src/models';
import { computed, toRef } from 'vue';

const props = defineProps<{
  index: number;
  offset: number;
  noteList: (Note | NotePreview)[];
}>();

const noteList = toRef(props, 'noteList');

const note = computed(() => {
  const { index } = props;

  const note = noteList.value[index];
  return note;
});
</script>
