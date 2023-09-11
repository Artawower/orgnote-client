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

const isFileAcceptable = (fileName: string) => {
  if (!props.accept) {
    return true;
  }
  const fileExtension = fileName.split('.').pop();
  return props.accept?.includes(fileExtension);
};

// TODO: master refactor
const handleDirectory = (
  dir: FileSystemDirectoryEntry
): Promise<FileSystemFileEntry[]> => {
  const dirReader = dir.createReader();
  const entriesList: FileSystemFileEntry[] = [];

  const asyncFileSystemReaders = [];

  return new Promise((resolve, reject) => {
    dirReader.readEntries(
      (entries) => {
        if (!entries.length) {
          resolve(entriesList);
          return;
        }
        asyncFileSystemReaders.push(
          entries.map(async (entry) => {
            if (entry.isFile && isFileAcceptable(entry.name)) {
              entriesList.push(entry);
            }
            if (entry.isFile) {
              resolve(entriesList);
              return;
            }
            const nestedFiles = await handleDirectory(
              entry as FileSystemDirectoryEntry
            );
            return nestedFiles;
          })
        );
      },
      (err) => reject(err)
    );

    return entriesList;
  });
};

const extractFiles = (
  items: DataTransferItemList
): Promise<FileSystemFileEntry[]> => {
  return Array.from(items).reduce(async (asyncAcc, item) => {
    const acc = await asyncAcc;
    const entry = item.webkitGetAsEntry();

    if (entry.isFile) {
      acc.push(entry);
      return acc;
    }
    const nestedFiles = await handleDirectory(
      entry as FileSystemDirectoryEntry
    );
    acc.push(...nestedFiles);
    return acc;
  }, Promise.resolve([]) as Promise<FileSystemFileEntry[]>);
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

window.addEventListener(
  'dragover',
  function (e) {
    e = e || event;
    e.preventDefault();
  },
  false
);
window.addEventListener(
  'drop',
  function (e) {
    e = e || event;
    e.preventDefault();
  },
  false
);
</script>

<style lang="scss" scoped>
.file-uploader {
  --file-uploader-border-width: 4px;
  --file-uploader-border-style: dashed;
  --file-uploader-border-color: var(--base-3);
  --file-uploader-bg: var(--bg-alt);
  --file-uploader-opacity: 0.8;

  position: relative;
  z-index: 10004;
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
