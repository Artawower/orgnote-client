<template>
  <raw-editor
    v-model="initialNoteText"
    @data-updated="dataUpdated"
  ></raw-editor>
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<script lang="ts" setup>
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import { ref, watch } from 'vue';
import { OrgNode } from 'org-mode-ast';
import { useNoteEditorStore } from 'src/stores';
import { useEditorActions } from 'src/hooks/editor-actions-hook';

const noteEditorStore = useNoteEditorStore();

const initialNoteText = ref<string>(noteEditorStore.noteText);

const dataUpdated = ([text, orgNode]: [string, OrgNode]) => {
  noteEditorStore.setNoteData(text, orgNode);
};

watch(
  () => noteEditorStore.noteText,
  (val) => {
    if (val === initialNoteText.value) {
      return;
    }
    initialNoteText.value = val;
  }
);

useEditorActions();
</script>
