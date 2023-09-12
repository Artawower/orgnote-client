<template>
  <span class="preview-link">
    <slot />
    <q-tooltip @show="loadNote">
      <div class="note-preview-wrapper flex items-center justify-center">
        <q-spinner-gears v-if="loading" size="3em"></q-spinner-gears>
        <template v-else>
          <h4 v-if="!note">{{ $t('Note not found') }}</h4>
          <public-note-preview
            v-else
            :notePreview="note"
            :show-author="false"
            :height="200"
            :hide-footer="true"
            :full-height="true"
          />
        </template>
      </div>
    </q-tooltip>
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { Note } from 'src/models';
import { useCurrentNoteStore } from 'src/stores';

import PublicNotePreview from './PublicNotePreview.vue';

const props = defineProps<{
  id: string;
}>();

const currentNoteStore = useCurrentNoteStore();

const note = ref<Note | null>(null);
const loading = ref<boolean>(true);

const loadNote = async () => {
  if (!props.id) {
    return;
  }
  [note.value] = await currentNoteStore.getNoteById(props.id);
  loading.value = false;
};
</script>

<styles lang="scss" scoped>
.note-preview-wrapper {
  --preview-link-max-width: 365px;
  --preview-link-height: 200px;

  max-width: var(--preview-link-max-width);
  width: var(--preview-link-max-width);
  height: var(--preview-link-height);
}
</styles>
