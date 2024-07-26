<template>
  <div
    @drop.prevent="onDrop"
    @dragenter.prevent="dragOver"
    @dragleave.prevent="dragLeave"
    class="file-uploader"
    :class="{ 'drag-target': dragInProgress }"
  >
    <div v-if="dragInProgress" class="upload-overlay fit q-p-xl">
      <div class="uploader-info fit flex justify-center items-center text-h1">
        {{ $t('Drag&drop your notes here!') }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { imageFileExtensions } from 'src/constants';
import { useDragStatus } from 'src/hooks/drag-status';
import { mockServer, traverseDirectory } from 'src/tools';
import { onBeforeUnmount, onBeforeMount } from 'vue';

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
  (e: 'uploaded', files: FileEntry[] | FileList): void;
  (e: 'dropped'): void;
}>();

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

const { reset, dragLeave, dragOver, dragInProgress } = useDragStatus('files');

const onDrop = async (e: DragEvent) => {
  emits('dropped');
  reset();
  e.preventDefault();
  const extracedFileEntries = await extractFiles(e.dataTransfer?.items);
  emits('uploaded', extracedFileEntries as FileEntry[]);
};

const preventDefault = (e: DragEvent) => e.preventDefault();

const preventDragAndDrop = () => {
  window.addEventListener('dragover', preventDefault, false);
  window.addEventListener('drop', preventDefault, false);
};

onBeforeMount(() => mockServer(preventDragAndDrop)());

onBeforeUnmount(
  mockServer(() => {
    window.removeEventListener('dragover', preventDefault);
    window.removeEventListener('drop', preventDefault);
  })
);
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
