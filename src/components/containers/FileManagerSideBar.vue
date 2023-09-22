<template>
  <sidebar-wrapper>
    <header-bar>
      <template v-slot:header>
        <div class="text-capitalize">
          <!-- TODO: master separated component -->
          <input
            class="file-search-input"
            name="search"
            type="text"
            v-model="search"
            :placeholder="$t('files')"
          />
        </div>
      </template>
      <template v-slot:actions>
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
      ref="qTreeRef"
      dense
      node-key="id"
      label-key="name"
      class="fit q-mt-md"
    >
      <template v-slot:default-header="prop">
        <file-manager-item :file-node="prop.node" @expand="expand" />
      </template>
    </q-tree>
  </sidebar-wrapper>
</template>

<script lang="ts" setup>
import { useFileManagerStore } from 'src/stores';

import SidebarWrapper from 'src/components/ui/SidebarWrapper.vue';
import HeaderBar from 'src/components/ui/HeaderBar.vue';
import IconBtn from 'src/components/ui/IconBtn.vue';
import FileManagerItem from './FileManagerItem.vue';
import { ref } from 'vue';
import { QTree } from 'quasar';

const fileManagerStore = useFileManagerStore();

const createFolder = () => {
  fileManagerStore.createFolder();
};

const search = ref<string>('');

const qTreeRef = ref<QTree | null>();

const isExpanded = ref<boolean>(false);

const toggleExpanding = () => {
  if (isExpanded.value) {
    qTreeRef.value?.collapseAll();
  } else {
    qTreeRef.value?.expandAll();
  }
  isExpanded.value = !isExpanded.value;
};

const expand = (key: string) => qTreeRef.value?.setExpanded(key, true);
</script>

<style lang="scss">
.file-search-input {
  width: 100%;

  &:focus {
    outline: none;
  }

  background-color: transparent;
  border: none;
  color: var(--fg);
}
</style>
