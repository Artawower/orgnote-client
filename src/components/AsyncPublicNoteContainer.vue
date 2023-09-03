<template>
  <div :style="{ height: height + 'px' }">
    <template v-if="note">
      <slot :note="note"></slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Note, NotePreview } from 'src/models';
import { computed, toRef } from 'vue';

const props = defineProps<{
  index: number;
  noteList: (Note | NotePreview)[];
  height: number;
}>();

const noteList = toRef(props, 'noteList');

const note = computed(() => {
  const { index } = props;

  const note = noteList.value[index];
  // console.log('✎: [line 23][scroll] index async container: ', index);
  return note;
});
</script>
