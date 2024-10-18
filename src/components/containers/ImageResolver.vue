<template>
  <q-img
    v-if="blobUrl ?? previewImg"
    class="pointer rounded-borders image-preview"
    @click="onImgClick"
    :width="width"
    :height="height"
    :no-transition="true"
    :no-spinner="true"
    :src="blobUrl ?? previewImg"
  />
  <div v-else class="image-preview not-found">
    <div>No image found</div>
    <q-icon class="color-main" name="no_photography" size="5rem"></q-icon>
  </div>
</template>

<script lang="ts" setup>
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { buildMediaFilePath } from 'src/tools';

import { computed, onBeforeMount, ref } from 'vue';

const props = defineProps<{
  src?: string;
  width?: string;
  height?: string;
  authorId?: string;
}>();

const blobUrl = ref<string | null>(null);

const { orgNoteApi } = useOrgNoteApiStore();
const fileStore = orgNoteApi.core.useFilesStore();

onBeforeMount(async () => {
  await initStoredMediaFile();
});

const initStoredMediaFile = async () => {
  blobUrl.value = await fileStore.getBlobUrl(props.src);
};

const previewImg = computed(() => {
  const folder = props.authorId ?? orgNoteApi.currentNote.get()?.author?.id;
  if (!folder) {
    return null;
  }
  const mediaFilePath = buildMediaFilePath(props.src, folder);
  return mediaFilePath;
});

const onImgClick = () => {
  if (blobUrl.value) {
    return;
  }
  window.open(previewImg.value, '_blank');
};
</script>

<style lang="scss" scoped>
.image-preview {
  max-width: var(--public-preview-image-width);
}
.not-found {
  @include flexify(column, center, center, var(--gap-md));
  min-height: min(320px, 100vw);
  border: var(--border-secondary);
  color: var(--fg-secondary);
  font-size: var(--font-size-lg);
  text-align: center;
  border-radius: var(--block-border-radius-md);
}
</style>
