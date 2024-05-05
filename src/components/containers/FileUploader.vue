<template>
  <div
    @drop.prevent="onDrop"
    @dragenter.prevent="dragOver"
    @dragleave.prevent="dragLeave"
    class="file-uploader"
    :class="{ 'drag-target': dragOnTarget }"
  >
    <div v-if="dragOnTarget" class="upload-overlay fit q-p-xl">
      <div class="uploader-info fit flex justify-center items-center text-h1">
        {{ $t('Drag&drop your notes here!') }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { imageFileExtensions } from 'src/constants';
import { traverseDirectory } from 'src/tools';

import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    accept?: string[];
    multiple?: boolean;
    directory?: boolean;
  }>(),
  {
    accept: () => ['org', ...imageFileExtensions],
  }
);

const emits = defineEmits<{
  (e: 'uploaded', files: FileSystemFileEntry[]): void;
  (e: 'dropped'): void;
}>();

const dragCount = ref<number>(0);

const dragOnTarget = computed(() => dragCount.value > 0);

const extractFiles = (
  items: DataTransferItemList
): Promise<FileSystemFileEntry[]> => {
  return Array.from(items).reduce(
    async (asyncAcc, item) => {
      const acc = await asyncAcc;
      const entry = item.webkitGetAsEntry();

      if (!entry) return acc;

      if (entry.isFile) {
        acc.push(entry as FileSystemFileEntry);
        return acc;
      }
      const nestedFiles = await traverseDirectory(
        entry as FileSystemDirectoryEntry,
        props.accept
      );

      acc.push(...nestedFiles);
      return acc;
    },
    Promise.resolve([]) as Promise<FileSystemFileEntry[]>
  );
};

const onDrop = async (e: DragEvent) => {
  emits('dropped');
  dragCount.value = 0;
  e.preventDefault();
  const extracedFileEntries = await extractFiles(e.dataTransfer?.items);
  emits('uploaded', extracedFileEntries);
};

const dragOver = (e: DragEvent) => {
  dragCount.value += 1;
  e.preventDefault();
};
const dragLeave = (e: DragEvent) => {
  dragCount.value -= 1;
  e.preventDefault();
};

if (process.env.CLIENT) {
  window.addEventListener(
    'dragover',
    function (e) {
      e.preventDefault();
    },
    false
  );
  window.addEventListener(
    'drop',
    function (e) {
      e.preventDefault();
    },
    false
  );
}
</script>

<style lang="scss" scoped>
.file-uploader {
  position: relative;
}
.drag-target {
  border-color: var(--file-uploader-border-color) !important;
}

.upload-overlay {
  background: var(--file-uploader-bg);
  opacity: var(--file-uploader-opacity);
  padding: 40px;
  position: fixed;
  z-index: 10000;
}

.uploader-info {
  box-sizing: border-box;
  border-width: var(--file-uploader-border-width);
  border-style: var(--file-uploader-border-style);
  border-color: var(--file-uploader-border-color);
}
</style>
