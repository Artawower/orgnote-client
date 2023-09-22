<template>
  <q-layout view="lHh Lpr lFf">
    <file-uploader
      class="main-content"
      @uploaded="notesImportStore.uploadFiles"
    >
      <action-side-panel
        v-if="$q.screen.gt.xs || sidebarStore.opened"
        :full-width="$q.screen.lt.sm"
        :user="user"
      />
      <q-page-container
        class="height-max-dynamic"
        :class="{ 'with-composite-bar': $q.screen.gt.xs }"
      >
        <router-view />
      </q-page-container>
      <mini-buffer />
      <completion-prompt />

      <ToolBar v-if="$q.screen.lt.sm" />
    </file-uploader>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCommandExecutor } from 'src/hooks';
import { useSidebarStore } from 'src/stores';
import { useAuthStore } from 'src/stores/auth';
import { useNotesImportStore } from 'src/stores/import-store';
import { useKeybindingStore } from 'src/stores/keybindings';

import { computed } from 'vue';

import ActionSidePanel from 'src/components/containers/ActionSidePanel.vue';
import CompletionPrompt from 'src/components/containers/CompletionPromt.vue';
import FileUploader from 'src/components/containers/FileUploader.vue';
import ProfileSideBar from 'src/components/containers/ProfileSideBar.vue';
import ToolBar from 'src/components/containers/ToolBar.vue';
import MiniBuffer from 'src/components/ui/MiniBuffer.vue';

const sidebarStore = useSidebarStore();

const authStore = useAuthStore();
const user = computed(() => authStore.user);
authStore.verifyUser();

const { registerKeybindings } = useKeybindingStore();

useCommandExecutor().register();

registerKeybindings([
  {
    handler: () => sidebarStore.toggleWithFallback(ProfileSideBar),
    command: 'toggleActionSidePanel',
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

.with-composite-bar {
  margin-left: var(--sidebar-width);
}
</style>
