<template>
  <span class="preview-link">
    <dynamic-tooltip position="bottom" @show="loadNote">
      <template #content>
        <slot />
      </template>
      <template #tooltip>
        <div class="note-preview-wrapper">
          <div
            class="preview-link-not-found flex items-center justify-center fit"
          >
            <loader-spinner class="spinner" v-if="loading"></loader-spinner>
            <template v-else>
              <h1 v-if="!note">
                {{ $t('Note not found') }}
              </h1>
              <public-note-preview
                class="q-pa-md"
                @click="openNote"
                v-else
                :note-preview="note"
                :show-author="false"
                :height="200"
                :hide-footer="true"
                :full-height="true"
              />
            </template>
          </div>
        </div>
      </template>
    </dynamic-tooltip>
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import DynamicTooltip from '../ui/DynamicTooltip.vue';
import PublicNotePreview from './PublicNotePreview.vue';
import LoaderSpinner from 'src/components/LoaderSpinner.vue';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { Note } from 'orgnote-api';

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

const { orgNoteApi } = useOrgNoteApiStore();

const openNote = () => {
  orgNoteApi.navigation.editNote(note.value.id);
};
</script>

<style lang="scss" scoped>
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
</style>
