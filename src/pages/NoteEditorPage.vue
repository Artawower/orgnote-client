<template>
  <q-page
    :class="{ flex: noteEditorStore.debug }"
    :style-fn="resetPageMinHeight"
  >
    <q-splitter
      v-if="noteEditorStore.debug"
      v-model="splitterSize"
      :horizontal="$q.screen.lt.sm"
      class="debug-splitter"
    >
      <template v-slot:before>
        <template v-if="noteLoaded">
          <router-view />
        </template>
      </template>
      <template v-slot:separator>
        <q-avatar
          color="primary"
          text-color="white"
          size="40px"
          icon="drag_indicator"
        />
      </template>
      <template v-slot:after>
        <div class="debug">
          <div class="common-info q-px-md">
            Cursor: {{ noteEditorStore.cursorPosition }}
          </div>
          <div class="debug-tree q-py-sm q-px-md">
            <note-debugger :cursor-position="noteEditorStore.cursorPosition" />
          </div>
        </div>
      </template>
    </q-splitter>
    <template v-else>
      <router-view></router-view>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { onChangeToolbarActions, useEditorCommands } from 'src/hooks';
import { RouteNames } from 'src/router/routes';
import { useCurrentNoteStore } from 'src/stores';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { resetPageMinHeight } from 'src/tools';
import { useRoute, useRouter } from 'vue-router';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

import NoteDebugger from 'src/components/containers/NoteDebugger.vue';

const route = useRoute();

const noteId = route.params.id as string;

const noteEditorStore = useNoteEditorStore();

const currentNoteStore = useCurrentNoteStore();
const { currentNote, currentOrgTree } = storeToRefs(currentNoteStore);

const splitterSize = ref<number>(50);

const setupEditorStore = () => {
  if (!currentNote.value) {
    return;
  }
  noteEditorStore.setFilePath(currentNote.value.filePath);
  noteEditorStore.setNoteContent(currentOrgTree.value as OrgNode);
  noteEditorStore.setCreatedTime(currentNote.value.createdAt);
};

setupEditorStore();
watch(
  () => currentNote.value,
  () => setupEditorStore()
);

currentNoteStore.selectNoteById(noteId);
watch(
  () => route.params.id,
  (val) => val && currentNoteStore.selectNoteById(val as string)
);

const noteLoaded = computed(
  () => !route.params.id || currentNote.value?.id === route.params.id
);

const $q = useQuasar();
const initLoaderStatus = () => {
  const loadingFn = noteLoaded.value ? $q.loading.hide : $q.loading.show;
  loadingFn();
};

initLoaderStatus();

watch(
  () => noteLoaded.value,
  () => initLoaderStatus()
);

onBeforeUnmount(() => {
  $q.loading.hide();
});

const router = useRouter();
onChangeToolbarActions({
  observe: ref(route.params),
  setupMainAction: () => ({
    icon: 'done',
    name: 'save',
    handler: () =>
      router.push({ name: RouteNames.NoteDetail, params: { id: noteId } }),
  }),
});

useEditorCommands();
</script>

<style lang="scss" scoped>
.debug-splitter {
  flex: 1;
  max-height: calc(100svh - 80px);
  height: calc(100svh - var(--footer-height) + 16px);
}

.debug {
  position: relative;

  .common-info {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
  }
}
</style>
