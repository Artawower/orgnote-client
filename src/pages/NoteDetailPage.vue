<template>
  <q-page class="height-auto" :style-fn="resetPageMinHeight">
    <encryption-required :note="currentNote">
      <author-info
        v-if="currentNote && !currentNote?.isMy"
        :author="currentNote?.author"
        class="q-pb-lg"
      >
        ></author-info
      >
      <note-detail :note="currentNote"></note-detail>
    </encryption-required>
  </q-page>
</template>

<script setup lang="ts">
import { useCurrentNoteStore } from 'src/stores/current-note';
import { storeToRefs } from 'pinia';
import { useDetailCommands } from 'src/hooks/note-detail-commands';
import { resetPageMinHeight } from 'src/tools';
import { useRoute } from 'vue-router';

import { watch } from 'vue';

import AuthorInfo from 'components/containers/AuthorInfo.vue';
import NoteDetail from 'src/components/containers/NoteDetail.vue';
import EncryptionRequired from 'src/components/containers/EncryptionRequred.vue';
import { useCurrentNoteMeta } from 'src/hooks/current-note-meta';

const route = useRoute();

const currentNoteStore = useCurrentNoteStore();

const { currentNote } = storeToRefs(currentNoteStore);

if (route.params.id) {
  await currentNoteStore.selectNoteById(route.params.id as string);
}

watch(
  () => route.params.id,
  (id) => id && currentNoteStore.selectNoteById(route.params.id as string)
);

useDetailCommands();
useCurrentNoteMeta();
</script>
