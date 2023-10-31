import { useFileManagerStore, useNotesStore } from '.';
import { EditorView } from 'codemirror';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { ModelsNoteMeta } from 'src/generated/api';
import { useNotifications } from 'src/hooks';
import { Note } from 'src/models';
import { generateFileName, getFileNameFromText } from 'src/tools';
import { getOrgNodeValidationErrors } from 'src/tools/validators';

import { computed, ref, shallowRef, toRaw } from 'vue';

export const useNoteEditorStore = defineStore('noteEditor', () => {
  const noteOrgData = ref<OrgNode>();
  const noteText = ref<string>();
  const lastSavedText = ref<string>();
  const filePath = ref<string[]>([]);
  const createdTime = ref<string>();
  const debug = ref<boolean>(false);
  const cursorPosition = ref<number>(0);
  const editorView = shallowRef<EditorView>(null);

  const fileManagerStore = useFileManagerStore();
  // TODO: master persistent value should be done via indexed db.
  const saveNoteData = (text: string, orgNode: OrgNode) => {
    if (setNoteContent(text, orgNode)) {
      save();
    }
  };

  const setNoteContent = (text: string, orgNode: OrgNode): boolean => {
    if (!filePath.value?.length) {
      return;
    }
    const titleChanged =
      orgNode.meta.title &&
      noteOrgData.value &&
      orgNode.meta.title !== noteOrgData.value?.meta.title;

    if (titleChanged) {
      const newName = `${getFileNameFromText(orgNode.meta.title)}.org`;
      fileManagerStore.updateFileManager();
      filePath.value.splice(-1, 1, newName);
    }
    noteText.value = text;
    noteOrgData.value = orgNode;
    return true;
  };

  const setNoteTree = (orgNode: OrgNode) => {
    setNoteContent(orgNode.rawValue, orgNode);
  };

  const setFilePath = (path: string[]) => {
    filePath.value = path;
  };

  const setCreatedTime = (time: string) => {
    createdTime.value = time;
  };

  const setNoteText = (text: string) => {
    noteText.value = text;
    noteOrgData.value = withMetaInfo(parse(text));
  };

  const notifications = useNotifications();
  const notesStore = useNotesStore();

  const orgTree = computed(
    () =>
      noteOrgData.value &&
      noteOrgData.value?.end !== 0 &&
      withMetaInfo(noteOrgData.value)
  );

  // TODO: master fix type
  const note = computed(
    (): Note =>
      orgTree.value && {
        content: orgTree.value,
        id: orgTree.value.meta.id,
        filePath: filePath.value ?? [
          generateFileName(orgTree.value.meta.title),
        ],
        meta: orgTree.value.meta as ModelsNoteMeta,
      }
  );

  const upsertNote = async () => {
    const now = new Date().toISOString();
    await notesStore.upsertNotesLocally([
      {
        content: lastSavedText.value,
        id: orgTree.value.meta.id,
        createdAt: createdTime.value ?? now,
        isMy: true,
        updatedAt: now,
        filePath: filePath.value?.length
          ? toRaw(filePath.value)
          : [generateFileName(orgTree.value.meta.title)],
        meta: toRaw(orgTree.value.meta as ModelsNoteMeta),
      },
    ]);
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
    upsertNote();
  };

  const saved = computed(() => lastSavedText.value === noteText.value);

  const toggleDebug = () => (debug.value = !debug.value);

  return {
    noteOrgData,
    noteText,
    note,
    orgTree,

    saveNoteData,
    saved,
    setNoteTree,
    setNoteText,
    setFilePath,
    setCreatedTime,

    toggleDebug,
    debug,
    cursorPosition,
    editorView,
  };
});
