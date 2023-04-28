import { defineStore } from 'pinia';
import { ref } from 'vue';
import { OrgNode, parse } from 'org-mode-ast';

export const useNoteEditorStore = defineStore('note-editor', () => {
  const noteOrgData = ref<OrgNode>();
  const noteText = ref<string>('');

  const setNoteOrgData = (orgData: OrgNode) => {
    noteOrgData.value = orgData;
    noteText.value = noteOrgData.value.rawValue;
  };

  const setNoteText = (text: string) => {
    noteText.value = text;
    noteOrgData.value = parse(text);
  };

  return {
    noteOrgData,
    noteText,

    setNoteOrgData,
    setNoteText,
  };
});
