<template>
  <q-layout view="lHh Lpr lFf">
    <file-uploader
      class="main-content"
      @uploaded="notesImportStore.uploadFiles"
    >
      <side-bar
        v-if="$q.screen.gt.xs || leftDrawerOpen"
        :full-width="$q.screen.lt.sm"
        :user="user"
        :opened="leftDrawerOpen"
        @opened="setLeftDrawerStatus"
      />
      <q-page-container class="height-max-dynamic">
        <router-view />
      </q-page-container>
      <mini-buffer />
      <completion-prompt />

      <ToolBar v-if="$q.screen.lt.sm" />
    </file-uploader>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useCommandExecutor } from 'src/hooks';
import { useKeybindingStore } from 'src/stores/keybindings';
import { useNotesImportStore } from 'src/stores/import-store';

import SideBar from 'src/components/containers/SideBar.vue';
import MiniBuffer from 'src/components/ui/MiniBuffer.vue';
import CompletionPrompt from 'src/components/containers/CompletionPromt.vue';
import FileUploader from 'src/components/containers/FileUploader.vue';
import ToolBar from 'src/components/containers/ToolBar.vue';

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);

const authStore = useAuthStore();
const user = computed(() => authStore.user);
authStore.verifyUser();

const { registerKeybindings } = useKeybindingStore();

useCommandExecutor().register();

registerKeybindings([
  {
    handler: () => toggleLeftDrawer(),
    command: 'toggleLeftBar',
    keySequence: 'o p',
    description: 'Toggle left sidebar',
  },
]);

const notesImportStore = useNotesImportStore();

const setLeftDrawerStatus = (status: boolean) =>
  (leftDrawerOpen.value = status);
</script>

<style lang="scss">
.content {
  max-width: var(--content-max-width);
  margin: auto;
}
</style>
