<template>
  <q-layout view="lHh Lpr lFf">
    <file-uploader
      class="main-content"
      @uploaded="notesImportStore.uploadFiles"
    >
      <side-bar :user="user" :opened="leftDrawerOpen" />
      <q-page-container class="height-max-dynamic">
        <router-view />
      </q-page-container>
      <mini-buffer />
      <completion-prompt />
    </file-uploader>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import SideBar from 'src/components/containers/SideBar.vue';
import MiniBuffer from 'src/components/ui/MiniBuffer.vue';
import CompletionPrompt from 'src/components/containers/CompletionPromt.vue';
import FileUploader from 'src/components/containers/FileUploader.vue';
import { useCommandExecutor } from 'src/hooks';
import { useKeybindingStore } from 'src/stores/keybindings';
import { useNotesImportStore } from 'src/stores/import-store';

const leftDrawerOpen = ref(true);
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
</script>

<style lang="scss">
.content {
  max-width: var(--content-max-width);
  margin: auto;
}
</style>
