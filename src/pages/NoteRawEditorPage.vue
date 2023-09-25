<template>
  <raw-editor v-model="orgData"></raw-editor>
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<script lang="ts" setup>
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import { ref, watch } from 'vue';
import { OrgNode } from 'org-mode-ast';
import { useNoteEditorStore } from 'src/stores';

const noteEditorStore = useNoteEditorStore();

const initialNote = noteEditorStore.noteText;

const orgData = ref<[string, OrgNode]>([initialNote, null]);

watch(
  () => orgData.value,
  (val) => noteEditorStore.setNoteData(val[0], val[1] as OrgNode)
);
</script>
