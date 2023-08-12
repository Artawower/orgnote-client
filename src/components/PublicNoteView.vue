<template>
  <article>
    <q-card flat class="q-mt-lg">
      <div class="q-px-sm" v-if="showUserProfiles && showAuthor">
        <author-info :author="note.author"></author-info>
      </div>

      <q-card-section
        horizontal
        :class="{ 'note-card-content': isTile, column: isTile }"
        class="note-card-content pointer"
        @click="openNoteDetail(note)"
      >
        <img
          v-if="isTile && previewImage"
          class="preview-image rounded-borders"
          :src="buildMediaFilePath(previewImage)"
        />
        <q-card-section class="fit q-pa-none q-pt-sm">
          <div class="text-overline q-px-sm">{{ note.meta.category }}</div>
          <div class="text-h4 text-weight-bold pointer q-px-sm">
            {{ note.meta.title }}
          </div>
          <file-path
            v-if="note.filePath"
            :filePath="note.filePath"
            class="q-py-xs q-px-sm"
          ></file-path>
          <div class="text-caption rft q-px-sm">
            {{ note.meta.description }}
          </div>
          <tag-list class="q-mt-md q-pa-sm" :tags="note?.meta?.fileTags" />
        </q-card-section>
        <q-card-section
          v-if="!isTile && previewImage"
          class="flex col-3 flex-start q-pa-none q-pt-sm"
        >
          <q-img
            v-if="previewImage"
            class="pointer rounded-borders image-preview"
            :src="buildMediaFilePath(previewImage)"
          />
          <!-- TODO: add fine markup for notes without preview-->
          <div v-else class="mock-picture pointer rounded-borders"></div>
        </q-card-section>
      </q-card-section>

      <q-card-actions class="q-px-none">
        <q-checkbox
          v-if="selectable"
          :model-value="selectedNotesStore.isNoteSelected(note.id)"
          @update:model-value="selectedNotesStore.toggleNoteSelection(note.id)"
        ></q-checkbox>
        <q-btn flat round icon="share" />
      </q-card-actions>
      <q-separator />
    </q-card>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';

import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'src/stores/notes';
import { useViewStore } from 'src/stores/view';

import TagList from 'components/TagList.vue';
import AuthorInfo from 'src/components/containers/AuthorInfo.vue';
import FilePath from 'src/components/containers/FilePath.vue';
import { Note } from 'src/models';
import { useSettingsStore } from 'src/stores/settings';
import { buildMediaFilePath } from 'src/tools';
import { useSelectedNotesStore } from 'src/stores';

const props = defineProps<{
  note: Note;
  showAuthor: boolean;
  selectable?: boolean;
}>();
const { note, selectable } = toRefs(props);

const notesStore = useNotesStore();
const router = useRouter();

const openNoteDetail = (note: Note) => {
  console.log('✎: [line 83][PublicNoteView.vue] note: ', note);
  notesStore.selectNote(note);
  router.push({ name: RouteNames.NoteDetail, params: { id: note.id } });
};

const viewStore = useViewStore();
const isTile = computed(() => viewStore.tile);

const settingsStore = useSettingsStore();

const { showUserProfiles } = toRefs(settingsStore);

const previewImage = ref(note.value.meta.images?.[0]);
watch(
  () => note.value.meta.images,
  (images) => {
    previewImage.value = images?.[0];
  }
);

const selectedNotesStore = useSelectedNotesStore();
</script>

<style lang="scss">
article {
  --public-preview-image-width: 112px;
  --public-preview-image-height: 112px;
  --public-preview-max-height: 168px;
}

.note-card-content {
  max-height: var(--public-preview-max-height);
}

.image-preview {
  height: var(--public-preview-image-height);
  max-width: var(--public-preview-image-width);
}

.mock-picture {
  width: var(--public-preview-image-width);
  height: var(--public-preview-image-height);
  background-color: $blue-grey-2;
}
</style>
