import { useFileManagerStore, useNotesStore } from '.';
import { EditorView } from 'codemirror';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { ModelsNoteMeta, ModelsPublicNote } from 'src/generated/api';
import { useNotifications } from 'src/hooks';
import { Note } from 'src/models';
import { generateFileName, textToKebab } from 'src/tools';
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
  const setNoteData = (text: string, orgNode: OrgNode) => {
    if (!filePath.value?.length) {
      return;
    }
    const titleChanged =
      orgNode.meta.title &&
      noteOrgData.value &&
      orgNode.meta.title !== noteOrgData.value?.meta.title;
    const newName = `${textToKebab(orgNode.meta.title)}.org`;
    if (titleChanged) {
      fileManagerStore.updateFileManager();
      filePath.value.splice(-1, 1, newName);
    }
    noteText.value = text;
    noteOrgData.value = orgNode;
    save();
  };

  const setNoteContent = (orgNode: OrgNode) => {
    setNoteData(orgNode.rawValue, orgNode);
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

  const rawNote = computed(
    (): ModelsPublicNote =>
      orgTree.value && {
        content: noteText.value,
        id: orgTree.value.meta.id,
        filePath: filePath.value ?? [
          generateFileName(orgTree.value.meta.title),
        ],
        meta: orgTree.value.meta as ModelsNoteMeta,
      }
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
        content: noteText.value,
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
    rawNote,
    note,
    orgTree,

    setNoteData,
    save,
    saved,
    setNoteContent,
    setNoteText,
    setFilePath,
    setCreatedTime,

    toggleDebug,
    debug,
    cursorPosition,
    editorView,
  };
});
