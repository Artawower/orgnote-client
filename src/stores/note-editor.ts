import { defineStore } from 'pinia';
import { ref } from 'vue';
import { OrgNode, parse } from 'org-mode-ast';

export const useNoteEditorStore = defineStore('note-editor', () => {
  const editedOrgData = ref<OrgNode | null>(null);
  const noteText = ref<string>('');

  const setNoteOrgData = (orgData: OrgNode) => {
    editedOrgData.value = orgData;
    noteText.value = editedOrgData.value.rawValue;
  };

  const setNoteText = (text: string) => {
    editedOrgData.value = parse(text);
  };

  return {
    editedOrgData,
    noteText,

    setNoteOrgData,
    setNoteText,
  };
});
