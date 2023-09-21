import { defineStore } from 'pinia';

import { getInitialNoteTemplate } from 'src/tools';
import { parse, withMetaInfo } from 'org-mode-ast';
import { Note } from 'src/models';
import { ModelsNoteMeta } from 'src/generated/api';
import { useNotesStore } from './notes';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { v4 } from 'uuid';

export const useNoteCreatorStore = defineStore('noteCreatorStore', () => {
  // TODO: master template list for plugins.

  const initNote = (note: Partial<Note>): Note => {
    const now = new Date().toISOString();
    return {
      createAt: now,
      updateAt: now,
      ...note,
    } as Note;
  };

  const notesStore = useNotesStore();
  const router = useRouter();

  const create = async (
    id?: string,
    filePath?: string[],
    templateId?: string
  ) => {
    id ??= v4();
    filePath ??= ['Untitled.org'];
    const content = getInitialNoteTemplate(id);
    const parsedNote = withMetaInfo(parse(content));
    const note = initNote({
      content,
      id,
      filePath,
      isMy: true,
      meta: parsedNote.meta as ModelsNoteMeta,
    });
    await notesStore.upsertNotesLocally([note]);
    router.push({
      name: RouteNames.EditNote,
      params: { id: note.id },
    });
  };

  return {
    create,
  };
});
