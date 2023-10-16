<template>
  <div
    @click="openNote"
    class="file-item q-py-xs q-px-sm full-width cursor-pointer"
    :class="{ 'edit-mode': editMode, active: isFileOpened }"
  >
    <div class="file-info">
      <q-icon v-if="!isFile" size="xs" name="folder"></q-icon>
      <input
        ref="fileNameInput"
        v-model="fileName"
        type="text"
        autofocus
        :readonly="!editMode"
        class="file-name"
        @focusout="stopEdit"
        @keydown.stop.enter="confirmEdit"
        @keydown.escape="stopEdit"
      />
    </div>
    <div v-show="!editMode" class="actions">
      <template v-if="!isFile">
        <icon-btn @click.stop="createFile" name="note_add" :hoverable="false" />
        <icon-btn
          @click.stop="createFolder"
          name="add_box"
          :hoverable="false"
        />
      </template>
      <icon-btn
        @click.stop.prevent="deleteFile"
        name="delete"
        :hoverable="false"
      />
      <icon-btn @click.stop.prevent="editName" name="edit" :hoverable="false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { RouteNames } from 'src/router/routes';
import {
  useAuthStore,
  useCurrentNoteStore,
  useFileManagerStore,
  useSidebarStore,
} from 'src/stores';
import { FlatTree, callKeyboard, convertFlatTreeToFileTree } from 'src/tools';
import { useRouter } from 'vue-router';

import { computed, onMounted, ref, watch } from 'vue';

import IconBtn from 'src/components/ui/IconBtn.vue';

const props = defineProps<{
  fileNode: FlatTree;
}>();

const emits = defineEmits<{
  (e: 'expand', key: string): void;
}>();

const fileName = ref(props.fileNode.name);
const isFile = props.fileNode.type === 'file';
const authStore = useAuthStore();

const deleteFile = () => {
  if (isFileOpened.value) {
    router.push({
      name: RouteNames.UserNotes,
      params: { userId: authStore.user.id },
    });
  }
  fileManagerStore.deleteFile(props.fileNode);
};

const createFolder = async () => {
  await fileManagerStore.createFolder(props.fileNode);
  emits('expand', props.fileNode.id);
  callKeyboard();
};

const createFile = async () => {
  await fileManagerStore.createFile(convertFlatTreeToFileTree(props.fileNode));
  emits('expand', props.fileNode.id);
};

const router = useRouter();
const sidebarStore = useSidebarStore();
const openNote = () => {
  if (editMode.value) {
    return;
  }
  if (props.fileNode.type === 'file') {
    router.push({
      name: RouteNames.RawEditor,
      params: { id: props.fileNode.id },
    });
  }
  sidebarStore.close();
};

const fileManagerStore = useFileManagerStore();

const editMode = ref(false);
const fileNameInput = ref<HTMLInputElement | null>();

const editName = () => {
  editMode.value = true;
  callKeyboard();
};

const confirmEdit = async () => {
  editMode.value = false;
  await fileManagerStore.renameFile(
    convertFlatTreeToFileTree(props.fileNode),
    fileName.value
  );
  fileManagerStore.stopEdit();
};

const $q = useQuasar();
const stopEdit = async () => {
  if (!editMode.value) {
    return;
  }
  if (!$q.platform.is.desktop) {
    await confirmEdit();
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
    // TODO: master doesn't work for ios
    fileNameInput.value.setSelectionRange(
      0,
      props.fileNode.name.length - 4,
      'forward'
    );
    fileNameInput.value.focus();
  });
};

watch(
  () => editMode.value,
  () => focusEditedInput()
);

watch(
  () => fileManagerStore.editedFileItem,
  () => tryInitEditMode()
);

watch(
  () => props.fileNode,
  (val) => {
    if (val.name !== fileName.value) {
      fileName.value = val.name;
    }
  }
);

const tryInitEditMode = () => {
  editMode.value =
    fileManagerStore.editedFileItem?.name &&
    fileManagerStore.editedFileItem?.name === props.fileNode.name;
};
tryInitEditMode();

onMounted(() => focusEditedInput());

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
  gap: var(--default-gap);
}

.file-name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  padding: 0;
  color: var(--fg);
  margin: 0;
  border: none;
  width: 100%;
  height: 100%;
  background: transparent;

  &:not(.edit-mode) {
    cursor: pointer;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border: none;
  }
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

    input {
      color: var(--bg);
    }

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

.mobile {
  .actions {
    display: flex;
  }
}

.edit-mode {
  background-color: var(--base5);

  input {
    color: var(--bg);
  }

  .file-name {
    width: 100%;
    background: var(--base5);

    &:focus {
      outline: none;
    }
  }
}
</style>
