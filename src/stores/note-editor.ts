import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';
import { useNotesStore } from '.';
import { generateFileName } from 'src/tools';
import { ModelsNoteMeta } from 'src/generated/api';
import { useNotifications } from 'src/hooks';
import { getOrgNodeValidationErrors } from 'src/tools/validators';

export const useNoteEditorStore = defineStore(
  'note-editor',
  () => {
    const noteOrgData = ref<OrgNode>();
    const noteText = ref<string>('');
    const lastSavedText = ref<string>('');
    const specialSymbolsHidden = ref<boolean>(false);

    const setNoteOrgData = (orgData: OrgNode) => {
      noteOrgData.value = orgData;
      noteText.value = noteOrgData.value.rawValue;
    };

    // TODO: master persistent value should be done via indexed db.
    const setNoteText = (text: string) => {
      noteText.value = text;
      noteOrgData.value = parse(text);
    };

    const notifications = useNotifications();
    const notesStore = useNotesStore();

    const createNote = (orgTree: OrgNode) => {
      notesStore.createNote({
        content: noteText.value,
        id: orgTree.meta.id,
        filePath: [generateFileName(orgTree.meta.title)],
        meta: orgTree.meta as ModelsNoteMeta,
      });
    };

    const save = () => {
      if (!noteOrgData.value) {
        return;
      }
      const orgTree = withMetaInfo(noteOrgData.value);
      const validationErrors = getOrgNodeValidationErrors(orgTree);
      if (validationErrors) {
        notifications.notify(validationErrors.join('\n'), false, 'error');
        return;
      }
      lastSavedText.value = noteText.value;
      createNote(orgTree);
    };

    const saved = computed(() => lastSavedText.value === noteText.value);

    return {
      noteOrgData,
      noteText,

      setNoteOrgData,
      setNoteText,
      specialSymbolsHidden,
      save,
      saved,
    };
  },
  { persist: true }
);
