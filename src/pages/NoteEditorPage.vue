<template>
  <q-page class="q-pa-md height-auto with-modeline">
    <template v-if="noteLoaded">
      <router-view />
    </template>
    <mode-line>
      <q-route-tab
        :to="{ name: RouteNames.RawEditor, params: { id: noteId } }"
        :exact="true"
        icon="draw"
        label="raw"
      ></q-route-tab>
      <q-route-tab
        :to="{ name: RouteNames.WysiwygEditor, params: { id: noteId } }"
        :exact="true"
        icon="wysiwyg"
        label="wysiwyg"
      ></q-route-tab>
      <q-route-tab
        :to="{ name: RouteNames.PreviewEditor, params: { id: noteId } }"
        :exact="true"
        icon="preview"
        :label="$t('preview')"
      ></q-route-tab>
      <q-btn @click="noteEditorStore.save" icon="save" flat></q-btn>
      <q-btn
        :icon="specialSymbolsHidden ? 'visibility_off' : 'visibility'"
        flat
        @click="specialSymbolsHidden = !specialSymbolsHidden"
      >
      </q-btn>
    </mode-line>
  </q-page>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import ModeLine from 'src/components/ui/ModeLine.vue';
import { RouteNames } from 'src/router/routes';
import { useCurrentNoteStore } from 'src/stores';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { computed, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const noteId = route.params.id as string;

const noteEditorStore = useNoteEditorStore();

const { specialSymbolsHidden } = storeToRefs(noteEditorStore);

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
  (val) => currentNoteStore.selectNoteById(val as string)
);
</script>

<style lang="scss">
.q-page {
  box-sizing: border-box;
}
</style>
