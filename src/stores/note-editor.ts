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

    // TODO: master persistent value should be done via indexed db.
    const setNoteData = (text: string, orgNode: OrgNode) => {
      noteText.value = text;
      noteOrgData.value = orgNode;
    };

    const setNoteContent = (orgNode: OrgNode) => {
      setNoteData(orgNode.rawValue, orgNode);
    };

    const setNoteText = (text: string) => {
      noteText.value = text;
      noteOrgData.value = withMetaInfo(parse(text));
    };

    const notifications = useNotifications();
    const notesStore = useNotesStore();

    const orgTree = computed(() => withMetaInfo(noteOrgData.value));

    const note = computed(() => {
      return {
        content: noteOrgData.value,
        id: orgTree.value.meta.id,
        filePath: [generateFileName(orgTree.value.meta.title)],
        meta: orgTree.value.meta as ModelsNoteMeta,
      };
    });

    const createNote = () => {
      notesStore.upsertNote({
        content: noteText.value,
        id: orgTree.value.meta.id,
        filePath: [generateFileName(orgTree.value.meta.title)],
        meta: orgTree.value.meta as ModelsNoteMeta,
      });
    };

    const save = () => {
      if (!noteOrgData.value) {
        return;
      }
      const validationErrors = getOrgNodeValidationErrors(orgTree.value);
      if (validationErrors) {
        notifications.notify(validationErrors.join('\n'), false, 'error');
        return;
      }
      lastSavedText.value = noteText.value;
      createNote();
    };

    const saved = computed(() => lastSavedText.value === noteText.value);

    return {
      noteOrgData,
      noteText,
      note,

      setNoteData,
      specialSymbolsHidden,
      save,
      saved,
      setNoteContent,
      setNoteText,
    };
  },
  { persist: true }
);
