<template>
  <span class="preview-link">
    <slot />
    <q-tooltip @show="loadNote" class="text-inherit">
      <div class="note-preview-wrapper">
        <div class="preview-link-not-found flex items-center fit">
          <loader-spinner class="spinner" v-if="loading"></loader-spinner>
          <template v-else>
            <h1 v-if="!note">
              {{ $t('Note not found') }}
            </h1>
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
      </div>
    </q-tooltip>
  </span>
</template>

<script lang="ts" setup>
import { Note } from 'src/models';
import { useCurrentNoteStore } from 'src/stores';

import { ref } from 'vue';

import PublicNotePreview from './PublicNotePreview.vue';
import LoaderSpinner from 'src/components/LoaderSpinner.vue';

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
  max-width: var(--note-preview-link-max-width);
  width: var(--note-preview-link-max-width);
  height: var(--note-preview-link-height);
}

.preview-link-not-found {
  background: var(--bg);
}

.spinner {
  transform: scale(0.45);
}

article {
  width: 100%;
}
</styles>
