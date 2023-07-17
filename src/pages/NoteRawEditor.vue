<template>
  <raw-editor
    v-model="orgData"
    :hideSpecialSymbols="specialSymbolsHidden"
  ></raw-editor>
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<script lang="ts" setup>
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';
import { getInitialNoteTemplate } from 'src/constants';
import { ref, watch } from 'vue';
import { OrgNode } from 'org-mode-ast';
import { useNoteEditorStore } from 'src/stores';
import { storeToRefs } from 'pinia';

const noteEditorStore = useNoteEditorStore();
const { specialSymbolsHidden } = storeToRefs(noteEditorStore);

const orgData = ref<[string, OrgNode]>([getInitialNoteTemplate(), null]);

watch(
  () => orgData.value,
  (val) => noteEditorStore.setNoteData(val[0], val[1] as OrgNode)
);
</script>
