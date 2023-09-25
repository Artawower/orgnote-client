<template>
  <q-page class="q-pa-md height-auto with-modeline">
    <template v-if="noteLoaded">
      <router-view />
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { onChangeToolbarActions } from 'src/hooks';
import { RouteNames } from 'src/router/routes';
import { useCurrentNoteStore } from 'src/stores';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { useRoute, useRouter } from 'vue-router';

import { computed, onBeforeUnmount, ref, watch } from 'vue';

const route = useRoute();

const noteId = route.params.id as string;

const noteEditorStore = useNoteEditorStore();

const currentNoteStore = useCurrentNoteStore();
const { currentNote, currentOrgTree } = storeToRefs(currentNoteStore);

const setupEditorStore = () => {
  if (!currentNote.value) {
    return;
  }
  noteEditorStore.setNoteContent(currentOrgTree.value as OrgNode);
  noteEditorStore.setFilePath(currentNote.value.filePath);
  noteEditorStore.setCreatedTime(currentNote.value.createdAt);
};

setupEditorStore();
watch(
  () => currentNote.value,
  () => setupEditorStore()
);

currentNoteStore.selectNoteById(noteId);

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
  noteEditorStore.save();
});

watch(
  () => route.params.id,
  (val) => val && currentNoteStore.selectNoteById(val as string)
);

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
</script>

<style lang="scss">
.q-page {
  box-sizing: border-box;
}
</style>
