<template>
  <q-page padding>
    <public-notes :notes="notesState.notes"></public-notes>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PublicNotes from 'components/PublicNotes.vue';
import { useNotesStore } from 'stores/notes';

export default defineComponent({
  name: 'IndexPage',
  components: {
    PublicNotes,
  },
  setup() {
    const notesState = useNotesStore();
    notesState.loadNotes();

    return {
      notesState,
    };
  },
});
</script>
