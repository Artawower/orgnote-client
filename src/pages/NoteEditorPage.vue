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
import { getInitialNoteTemplate } from 'src/constants';
import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'src/stores';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const noteId = route.params.id as string;

const noteEditorStore = useNoteEditorStore();

const { specialSymbolsHidden } = storeToRefs(noteEditorStore);
const notesStore = useNotesStore();

const { selectedNote } = storeToRefs(notesStore);

const setupEditorStore = () => {
  if (!selectedNote.value) {
    return;
  }
  noteEditorStore.setNoteContent(selectedNote.value.content as OrgNode);
  noteEditorStore.setFilePath(selectedNote.value.filePath);
};

if (noteId) {
  setupEditorStore();
  watch(
    () => selectedNote.value,
    () => setupEditorStore()
  );
} else {
  noteEditorStore.setNoteText(getInitialNoteTemplate());
}

if (noteId) {
  notesStore.selectNoteById(noteId);
}

const noteLoaded = computed(() => !noteId || selectedNote.value?.id === noteId);

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
</script>

<style lang="scss">
.q-page {
  box-sizing: border-box;
}
</style>
