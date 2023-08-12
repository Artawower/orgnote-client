<template>
  <div class="footer column q-py-bp-lg full-width">
    <slot></slot>
    <div class="note-actions full-width row justify-between">
      <div class="left">
        <q-checkbox
          v-if="selectable"
          size="sm"
          :model-value="selectedNotesStore.isNoteSelected(note.id)"
          @update:model-value="selectedNotesStore.toggleNoteSelection(note.id)"
        ></q-checkbox>
      </div>
      <div class="right row gap-md">
        <q-btn size="sm" flat round icon="far fa-bookmark" class="q-pa-none" />
        <q-btn
          size="sm"
          flat
          round
          icon="far fa-paper-plane"
          class="q-pa-none"
        />
        <q-btn size="sm" flat round icon="fas fa-ellipsis" class="q-pa-none" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Note } from 'src/models';
import { useSelectedNotesStore } from 'src/stores';
import { toRef } from 'vue';

const props = defineProps<{
  selectable?: boolean;
  note: Note;
}>();

const selectable = toRef(props, 'selectable');

const selectedNotesStore = useSelectedNotesStore();
</script>

<style lang="scss"></style>
