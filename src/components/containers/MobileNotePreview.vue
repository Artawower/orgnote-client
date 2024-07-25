<template>
  <system-dialog v-model="dialog" @closed="emits('closed')">
    <div class="q-pa-md bg-main note-preview">
      <public-note-preview
        @click="openNote"
        :note-preview="note"
        :show-author="false"
        :height="200"
        :hide-footer="true"
        :full-height="true"
      />
    </div>
  </system-dialog>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, watch } from 'vue';
import PublicNotePreview from './PublicNotePreview.vue';
import SystemDialog from 'src/components/ui/SystemDialog.vue';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { Note } from 'orgnote-api';

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
  padding-bottom: calc(var(--block-padding-md) + var(--device-padding-bottom));
}
</style>
