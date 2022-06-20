<template>
  <q-page padding>
    <public-notes :notes="notesState.notes"></public-notes>
  </q-page>
</template>

<script lang="ts" setup>
import PublicNotes from 'components/PublicNotes.vue';
import { useNotesStore } from 'stores/notes';

const notesState = useNotesStore();
notesState.loadNotes();
</script>
