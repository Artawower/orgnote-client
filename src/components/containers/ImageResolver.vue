<template>
  <q-img
    class="pointer rounded-borders image-preview"
    :src="blobUrl ?? buildMediaFilePath(previewImg)"
  />
</template>

<script lang="ts" setup>
import { buildMediaFilePath, getFileName } from 'src/tools';
import { useFileStore } from 'src/stores';
import { computed, onBeforeMount, ref } from 'vue';

const props = defineProps<{
  src: string | null;
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

const previewImg = computed(() => {
  return buildMediaFilePath(props.src);
});
</script>

<style lang="scss" scoped>
.image-preview {
  height: var(--public-preview-image-height);
  max-width: var(--public-preview-image-width);
}
</style>
