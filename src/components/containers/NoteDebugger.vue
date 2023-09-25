<template>
  <div class="org-debug q-py-sm q-px-md">
    {{ parsedNoteTextTree }}
  </div>
</template>

<script lang="ts" setup>
import { useNoteEditorStore } from 'src/stores';

import { computed } from 'vue';

const noteEditorStore = useNoteEditorStore();
const parsedNoteTextTree = computed(() => noteEditorStore.orgTree?.toString());
</script>

<style lang="scss" scoped>
.org-debug {
  font-family: var(--editor-font-family-main);
  white-space: pre-wrap;
}
</style>
