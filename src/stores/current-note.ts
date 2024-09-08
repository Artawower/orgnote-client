import { useAuthStore } from './auth';
import { OrgNode, parse, withMetaInfo } from 'org-mode-ast';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';

import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';
import { mockServer } from 'src/tools';
import { Note, OrgNoteEncryption } from 'orgnote-api';
import { useFileSystemStore } from 'src/stores/file-system.store';
import { ModelsPublicNote } from 'orgnote-api/remote-api';

type ParsedNote = { note: Note; orgTree?: OrgNode };

export const useCurrentNoteStore = defineStore('current-note', () => {
  const currentNote = ref<Note | null>(null);
  const noteText = ref<string | null>(null);
  const noteCache = ref<ParsedNote[]>([]);
  const currentOrgTree = ref<OrgNode | null>(null);
  const { readTextFile, writeFile: writeTextFile } = useFileSystemStore();

  // TODO: master add to configuration file.
  const cacheSize = 10;

  const router = useRouter();

  // const selectNoteFromCache = async (noteId: string): Promise<ParsedNote> => {
  //   const foundParsedNote = noteCache.value.find((pn) => pn.note.id === noteId);
  //   return foundParsedNote as ParsedNote;
  // };

  const selectPublicNote = async (
    noteId: string
  ): Promise<ModelsPublicNote> => {
    try {
      const note = (await sdk.notes.notesIdGet(noteId)).data.data;
      return note;
    } catch (e: unknown) {
      // TODO: master handle error here [low]
      console.log(
        '🦄: [line 41][current-note.ts] unable to load note [35me: ',
        e
      );
    }
  };

  const selectMyNote = async (noteId: string): Promise<Note> => {
    const myNote = (await repositories.notes.getById(noteId)) as Note;

    if (!myNote) {
      return;
    }

    mockServer(() => touchNoteByAuthor(myNote));

    return myNote;
  };

  const touchNoteByAuthor = (myNote: Note): void => {
    const authStore = useAuthStore();

    myNote.author = authStore.user;
    myNote.isMy = true;
    repositories.notes.touchNote(myNote.id);
  };

  const cacheNote = (parsedNote: ParsedNote) => {
    noteCache.value = [parsedNote, ...noteCache.value].slice(0, cacheSize);
  };

  const getNoteById = async (
    noteId: string
  ): Promise<[Note?, OrgNode?, string?]> => {
    const note =
      (await selectMyNote(noteId)) ?? (await selectPublicNote(noteId));

    if (!note) {
      return [];
    }

    try {
      const noteText =
        (note as ModelsPublicNote).content ??
        (await readTextFile(note.filePath));
      const orgTree = mockServer(() => withMetaInfo(parse(noteText)))();

      const parsedNote: ParsedNote = { note, orgTree };

      cacheNote(parsedNote);

      return [note, orgTree, noteText];
    } catch (e) {
      console.warn('[line 98]: get note by id: read file from fs', e);
      return [];
    }
  };

  const selectNoteById = async (noteId: string): Promise<void> => {
    resetNote();

    let text: string;
    [currentNote.value, currentOrgTree.value, text] = await getNoteById(noteId);
    if (!currentNote.value) {
      router.push({ name: RouteNames.NotFound });
    }

    noteText.value = text;
  };

  const resetNote = (): void => {
    currentNote.value = null;
    noteText.value = null;
  };

  const updateCurrentNotePartially = async (
    note: Partial<Note>
  ): Promise<void> => {
    if (!currentNote.value) {
      return;
    }

    currentNote.value = { ...currentNote.value, ...note };
  };

  const reloadCurrentNote = async (): Promise<void> => {
    if (!currentNote.value) {
      return;
    }

    const [note, orgTree] = await getNoteById(currentNote.value.id);

    if (!note) {
      return;
    }

    try {
      noteText.value = await readTextFile(note.filePath);
    } catch (e) {
      console.warn('[line 136]: reload current note: read file from fs', e);
      return;
    }
    currentNote.value = note;
    currentOrgTree.value = orgTree;
  };

  const getNoteContent = async (
    noteId: string,
    encryptionConfig?: OrgNoteEncryption
  ): Promise<string> => {
    const noteInfo = await repositories.notes.getById(noteId);
    const noteContent = await readTextFile(noteInfo.filePath, encryptionConfig);
    return noteContent;
  };

  const updateNoteContent = async (
    noteId: string,
    content: string,
    encryptionConfig?: OrgNoteEncryption
  ) => {
    const noteInfo = await repositories.notes.getById(noteId);
    await writeTextFile(noteInfo.filePath, content, encryptionConfig);
  };

  return {
    // TODO: refactor -> noteDetail
    currentNote,
    noteText,
    currentOrgTree,
    selectNoteById,
    getNoteById,
    resetNote,
    updateCurrentNotePartially,
    reloadCurrentNote,
    getNoteContent,
    updateNoteContent,
  };
});
