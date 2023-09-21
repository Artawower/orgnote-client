<template>
  <div
    @click="openNote"
    class="file-item q-py-xs q-px-sm full-width cursor-pointer"
    :class="{ 'edit-mode': editMode, active: isFileOpened }"
  >
    <div class="file-info">
      <q-icon v-if="!isFile" size="xs" name="folder"></q-icon>
      <div
        ref="fileNameInput"
        class="file-name"
        :contentEditable="editMode"
        @focusout="stopEdit"
        @keydown.stop.enter="confirmEdit"
        @keydown.escape="stopEdit"
        @input="updateFileName"
      >
        {{ fileName }}
      </div>
    </div>
    <div class="actions">
      <template v-if="!isFile">
        <icon-btn @click.stop="createFile" name="note_add" :hoverable="false" />
        <icon-btn
          @click.stop="createFolder"
          name="add_box"
          :hoverable="false"
        />
      </template>
      <icon-btn @click.stop="deleteFile" name="delete" :hoverable="false" />
      <icon-btn @click.stop="editName" name="edit" :hoverable="false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';

import IconBtn from 'src/components/ui/IconBtn.vue';
import { useCurrentNoteStore, useFileManagerStore } from 'src/stores';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { convertFlatTreeToFileTree, FlatTree } from 'src/tools';

const props = defineProps<{
  fileNode: FlatTree;
}>();

const fileName = ref(props.fileNode.name);
const isFile = props.fileNode.type === 'file';

const deleteFile = () => {
  fileManagerStore.deleteFile(props.fileNode);
};

const createFolder = () => {
  fileManagerStore.createFolder(props.fileNode);
};

const createFile = () => {
  fileManagerStore.createFile(convertFlatTreeToFileTree(props.fileNode));
};

const router = useRouter();
const openNote = () => {
  if (props.fileNode.type === 'file') {
    router.push({
      name: RouteNames.NoteDetail,
      params: { id: props.fileNode.id },
    });
  }
};

const fileManagerStore = useFileManagerStore();

const editMode = ref(false);
const fileNameInput = ref<HTMLInputElement | null>();

const editName = () => {
  editMode.value = true;
};

const confirmEdit = () => {
  editMode.value = false;
  fileManagerStore.renameFile(props.fileNode, fileName.value);
  fileManagerStore.stopEdit();
};

const stopEdit = () => {
  if (!editMode.value) {
    return;
  }
  fileManagerStore.stopEdit();
  editMode.value = false;
  fileName.value = props.fileNode.name;
};

const focusEditedInput = () => {
  if (!editMode.value || !fileNameInput.value) {
    return;
  }
  setTimeout(() => {
    fileNameInput.value.focus();

    // Move carriage to the end of fileNameInput
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(fileNameInput.value, 1);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, 100);
};

watch(
  () => editMode.value,
  () => focusEditedInput()
);

watch(
  () => fileManagerStore.editedFileItem,
  () => tryInitEditMode()
);

const tryInitEditMode = () => {
  editMode.value =
    fileManagerStore.editedFileItem?.name &&
    fileManagerStore.editedFileItem?.name === props.fileNode.name;
};
tryInitEditMode();

onMounted(() => focusEditedInput());

const updateFileName = (e: Event) => {
  const target = e.target as HTMLDivElement;
  fileName.value = target.innerText;
};

const currentNoteStore = useCurrentNoteStore();
const isFileOpened = computed(() => {
  return (
    currentNoteStore.currentNote &&
    currentNoteStore.currentNote?.id === props.fileNode.id
  );
});
</script>

<style lang="scss" scoped>
.actions {
  @include flexify(row);
}

.file-name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.file-info {
  @include flexify(row, flex-start);
  gap: 6px;
  width: 100%;
}

.file-item {
  @include flexify(rows, space-between);

  max-height: var(--file-item-height);
  height: var(--file-item-height);

  border-radius: 4px;

  .actions {
    display: none;
  }

  &:hover:not(.edit-mode),
  &.active:not(.edit-mode) {
    background-color: var(--file-item-bg-hover);
    color: var(--file-item-color-hover);

    .file-info {
      width: calc(100% - 96px);
    }

    .actions {
      display: flex;
    }

    .icon-btn {
      color: var(--file-item-color-hover);
    }
  }
}

.edit-mode {
  background-color: var(--base5);

  .file-name {
    width: 100%;
    background: var(--base5);

    &:focus {
      outline: none;
    }
  }
}
</style>
