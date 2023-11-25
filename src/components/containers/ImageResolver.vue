<template>
  <q-img
    class="pointer rounded-borders image-preview"
    @click="onImgClick"
    :width="width"
    :height="height"
    :no-transition="true"
    :no-spinner="true"
    :src="blobUrl ?? previewImg"
  />
</template>

<script lang="ts" setup>
import { useFileStore, useOrgNoteApiStore } from 'src/stores';
import { buildMediaFilePath, getFileName } from 'src/tools';

import { computed, onBeforeMount, ref } from 'vue';

const props = defineProps<{
  src?: string;
  width?: string;
  height?: string;
  authorId?: string;
}>();

const fileStore = useFileStore();
const blobUrl = ref<string | null>(null);

onBeforeMount(async () => {
  await initStoredMediaFile();
});

const initStoredMediaFile = async () => {
  const fileName = getFileName(props.src);
  const file = await fileStore.getFile(fileName);
  if (!file) {
    return;
  }
  blobUrl.value = URL.createObjectURL(file);
};

const { orgNoteApi } = useOrgNoteApiStore();

const previewImg = computed(() => {
  const folder =
    props.authorId ?? orgNoteApi.currentNote.getCurrentNote()?.author.id;
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
</style>
