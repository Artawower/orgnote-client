<template>
  <q-dialog
    v-model="dialog"
    position="bottom"
    :no-focus="false"
    @hide="emits('closed')"
  >
    <div class="q-pa-md bg-main note-preview">
      <public-note-preview
        @click="openNote"
        :notePreview="note"
        :show-author="false"
        :height="200"
        :hide-footer="true"
        :full-height="true"
      />
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Note } from 'src/models';
import { useCurrentNoteStore, useOrgNoteApiStore } from 'src/stores';

import { onBeforeMount, ref, watch } from 'vue';

import PublicNotePreview from './PublicNotePreview.vue';

const props = defineProps<{
  note?: Note;
  noteId?: string;
}>();

const emits = defineEmits<{
  (e: 'closed'): void;
}>();

const dialog = ref(false);
const { orgNoteApi } = useOrgNoteApiStore();

const currentNoteStore = useCurrentNoteStore();
const note = ref<Note | null>(props.note);

watch(
  () => note.value,
  (val) => {
    dialog.value = !!val;
  }
);

watch(
  () => props.noteId,
  async (val) => {
    if (val) {
      await loadCurrentNote();
      return;
    }
    note.value = undefined;
  }
);

onBeforeMount(async () => {
  if (!note.value && props.noteId) {
    await loadCurrentNote();
  }
});

const loadCurrentNote = async () => {
  [note.value] = await currentNoteStore.getNoteById(props.noteId);
};

const openNote = () => orgNoteApi.navigation.editNote(note.value.id);
</script>

<style lang="scss" scoped>
.note-preview {
  padding-bottom: calc(
    var(--default-block-padding) + var(--device-padding-bottom)
  );
}
</style>
