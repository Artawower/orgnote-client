<template>
  <h1>Hey</h1>
  <public-notes></public-notes>
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
  },
});
</script>
