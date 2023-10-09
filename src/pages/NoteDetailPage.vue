<template>
  <q-page class="note-view height-auto" :style-fn="resetPageMinHeight">
    <author-info
      v-if="currentNote && !currentNote?.isMy"
      :author="currentNote?.author"
      class="q-pb-lg"
    >
      ></author-info
    >
    <note-detail
      :note="currentNote"
      :org-tree="currentOrgTree as OrgNode"
    ></note-detail>
  </q-page>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { storeToRefs } from 'pinia';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { resetPageMinHeight } from 'src/tools';
import { useRoute } from 'vue-router';

import { watch } from 'vue';

import AuthorInfo from 'components/containers/AuthorInfo.vue';
import NoteDetail from 'src/components/containers/NoteDetail.vue';

const route = useRoute();

const currentNoteStore = useCurrentNoteStore();

const { currentNote, currentOrgTree } = storeToRefs(currentNoteStore);

if (route.params.id) {
  currentNoteStore.selectNoteById(route.params.id as string);
}

watch(
  () => route.params.id,
  (id) => id && currentNoteStore.selectNoteById(route.params.id as string)
);
</script>
