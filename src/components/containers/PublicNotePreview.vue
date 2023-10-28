<template>
  <article :style="{ height }">
    <q-card v-if="notePreview" class="full-height" flat>
      <div
        class="q-px-sm"
        v-if="(notePreview as Note)?.author && showUserProfiles && showAuthor"
      >
        <author-info :author="(notePreview as Note).author"></author-info>
      </div>
      <q-card-section
        horizontal
        :class="{
          'note-card-content': isTile || !fullHeight,
          column: isTile,
          'full-height': fullHeight,
        }"
        class="pointer q-px-sm"
        @click="openNoteDetail(notePreview)"
      >
        <image-resolver v-if="isTile && previewImage" :src="previewImage" />

        <q-card-section
          class="fit q-pa-none q-pt-sm note-text-content"
          :class="{ 'content-with-img': !!previewImage }"
        >
          <div class="full-width">
            <div class="text-overline">
              {{ notePreview.meta.category }}
            </div>
            <div class="text-h4 text-weight-bold pointer">
              {{ notePreview.meta.title }}
            </div>
            <file-path
              v-if="notePreview.filePath"
              :filePath="notePreview.filePath"
              class="q-py-xs"
            ></file-path>
            <div class="text-caption rft description">
              <span
                v-if="settingsStore.config.common.developerMode"
                class="italic color-secondary"
              >
                [{{ new Date(notePreview.updatedAt).toLocaleString() }}]
              </span>
              {{ notePreview.meta.description }}
            </div>
          </div>
          <tag-list :tags="notePreview?.meta?.fileTags" />
        </q-card-section>

        <q-card-section
          v-if="!isTile && previewImage"
          class="flex col-3 flex-start q-pa-none q-pt-sm justify-end img-preview-section"
        >
          <image-resolver v-if="previewImage" :src="previewImage" />
          <!-- TODO: add fine markup for notes without preview-->
          <div v-else class="mock-picture pointer rounded-borders"></div>
        </q-card-section>
      </q-card-section>

      <q-card-actions
        v-if="!hideFooter"
        class="q-px-none justify-between q-my-sm actions"
      >
        <note-footer :note="notePreview" :selectable="selectable"></note-footer>
      </q-card-actions>
      <q-separator v-if="!hideFooter" />
    </q-card>
  </article>
</template>

<script setup lang="ts">
import { Note, NotePreview } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { useSettingsStore } from 'src/stores/settings';
import { useViewStore } from 'src/stores/view';
import { useRouter } from 'vue-router';

import { computed, ref, toRefs, watch } from 'vue';

import NoteFooter from 'src/components/NoteFooter.vue';
import TagList from 'src/components/TagList.vue';
import AuthorInfo from 'src/components/containers/AuthorInfo.vue';
import FilePath from 'src/components/containers/FilePath.vue';
import ImageResolver from 'src/components/containers/ImageResolver.vue';

const props = defineProps<{
  notePreview: Note | NotePreview;
  showAuthor: boolean;
  selectable?: boolean;
  height: number;
  hideFooter?: boolean;
  fullHeight?: boolean;
}>();
const { notePreview, selectable } = toRefs(props);
const height = computed(() => `${props.height}px`);

const router = useRouter();

const openNoteDetail = (note: Note | NotePreview) => {
  const routeName = note.isMy ? RouteNames.RawEditor : RouteNames.NoteDetail;
  router.push({
    name: routeName,
    params: { id: note.id },
  });
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
.note-card-content {
  max-height: var(--public-preview-max-height);
  height: var(--public-preview-max-height);
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
