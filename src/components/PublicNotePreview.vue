<template>
  <article :style="{ height }">
    <q-card v-if="notePreview" flat>
      <div
        class="q-px-sm"
        v-if="(notePreview as Note)?.author && showUserProfiles && showAuthor"
      >
        <author-info :author="(notePreview as Note).author"></author-info>
      </div>
      <q-card-section
        horizontal
        :class="{ 'note-card-content': isTile, column: isTile }"
        class="note-card-content pointer"
        @click="openNoteDetail(notePreview)"
      >
        <img
          v-if="isTile && previewImage"
          class="preview-image rounded-borders"
          :src="buildMediaFilePath(previewImage)"
        />

        <q-card-section
          class="fit q-pa-none q-pt-sm note-text-content"
          :class="{ 'content-with-img': !!previewImage }"
        >
          <div class="full-width">
            <div class="text-overline q-px-sm">
              {{ notePreview.meta.category }}
            </div>
            <div class="text-h4 text-weight-bold pointer q-px-sm">
              {{ notePreview.meta.title }}
            </div>
            <file-path
              v-if="notePreview.filePath"
              :filePath="notePreview.filePath"
              class="q-py-xs q-px-sm"
            ></file-path>
            <div class="text-caption rft q-px-sm description">
              {{ notePreview.meta.description }}
            </div>
          </div>
          <tag-list class="q-pa-sm" :tags="notePreview?.meta?.fileTags" />
        </q-card-section>

        <q-card-section
          v-if="!isTile && previewImage"
          class="flex col-3 flex-start q-pa-none q-pt-sm justify-end img-preview-section"
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

      <q-card-actions class="q-px-none justify-between q-my-sm actions">
        <note-footer :note="notePreview" :selectable="selectable"></note-footer>
      </q-card-actions>
      <q-separator />
    </q-card>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';

import { RouteNames } from 'src/router/routes';
import { useViewStore } from 'src/stores/view';

import { Note, NotePreview } from 'src/models';
import { useSettingsStore } from 'src/stores/settings';
import { buildMediaFilePath } from 'src/tools';
import TagList from 'components/TagList.vue';
import AuthorInfo from 'src/components/containers/AuthorInfo.vue';
import FilePath from 'src/components/containers/FilePath.vue';
import NoteFooter from 'src/components/NoteFooter.vue';

const props = defineProps<{
  notePreview: Note | NotePreview;
  showAuthor: boolean;
  selectable?: boolean;
  height: number;
}>();
const { notePreview, selectable } = toRefs(props);
const height = computed(() => `${props.height}px`);

const router = useRouter();

const openNoteDetail = (note: Note | NotePreview) => {
  router.push({ name: RouteNames.NoteDetail, params: { id: note.id } });
};

const viewStore = useViewStore();
const isTile = computed(() => viewStore.tile);

const settingsStore = useSettingsStore();

const { showUserProfiles } = toRefs(settingsStore);

const previewImage = ref(notePreview.value?.meta.images?.[0]);
watch(
  () => notePreview.value?.meta.images,
  (images) => {
    previewImage.value = images?.[0];
  }
);
</script>

<style lang="scss" scoped>
article {
  --public-preview-image-width: 112px;
  --public-preview-image-height: 112px;
  --public-preview-max-height: 156px;
}

.note-card-content {
  max-height: var(--public-preview-max-height);
  height: var(--public-preview-max-height);
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

.description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-text-content {
  @include flexify(column, space-between, flex-start);
}

.content-with-img {
  max-width: 66.66%;
  width: 66.66%;
}

.img-preview-section {
  flex: 1;
}
</style>
