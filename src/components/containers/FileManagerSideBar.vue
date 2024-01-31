<template>
  <sidebar-wrapper>
    <header-bar>
      <template v-slot:header>
        <div class="text-capitalize">
          <search-input v-model="search" placeholder="files" />
        </div>
      </template>
      <template v-slot:actions>
        <icon-btn @click="importFiles" name="cloud_upload" />
        <icon-btn
          @click="toggleExpanding"
          :name="isExpanded ? 'unfold_less' : 'unfold_more'"
        />
        <icon-btn @click="createFolder" name="add_box" />
      </template>
    </header-bar>
    <q-tree
      :nodes="fileManagerStore.fileManager"
      :filter="search"
      :key="fileManagerStore.fileManager.length"
      v-model:expanded="fileManagerStore.expandedNodes"
      no-transition
      ref="qTreeRef"
      dense
      node-key="id"
      label-key="name"
      class="q-mt-md"
    >
      <template v-slot:default-header="prop">
        <file-manager-item :file-node="prop.node" @expand="expand" />
      </template>
    </q-tree>
  </sidebar-wrapper>
</template>

<script lang="ts" setup>
import { QTree } from 'quasar';
import { useFileManagerStore } from 'src/stores';
import { useNotesImportStore } from 'src/stores/import-store';
import { revealKeyboard, uploadFiles } from 'src/tools';

import { ref, watch } from 'vue';

import FileManagerItem from './FileManagerItem.vue';
import HeaderBar from 'src/components/ui/HeaderBar.vue';
import IconBtn from 'src/components/ui/IconBtn.vue';
import SearchInput from 'src/components/ui/SearchInput.vue';
import SidebarWrapper from 'src/components/ui/SidebarWrapper.vue';

const fileManagerStore = useFileManagerStore();
const createFolder = () => {
  fileManagerStore.createFolder();
  revealKeyboard();
};

const search = ref<string>('');

const qTreeRef = ref<QTree | null>();

const isExpanded = ref<boolean>(true);

const toggleExpanding = () => {
  if (isExpanded.value) {
    qTreeRef.value?.collapseAll();
  } else {
    qTreeRef.value?.expandAll();
  }
  isExpanded.value = !isExpanded.value;
};

const expand = (key: string) => qTreeRef.value?.setExpanded(key, true);

watch(
  () => search.value,
  (value) => {
    if (!value?.length) {
      return;
    }
    qTreeRef.value?.expandAll();
  }
);

const notesImportStore = useNotesImportStore();
const importFiles = async () => {
  const files = await uploadFiles({ multiple: true, accept: '.org' });
  notesImportStore.uploadFiles(files);
};
</script>
