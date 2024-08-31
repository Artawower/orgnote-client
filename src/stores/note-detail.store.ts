import { defineStore } from 'pinia';
import { repositories } from 'src/boot/repositories';
import { useFileSystemStore } from './file-system.store';
import { useEncryption } from 'src/hooks';
import { OrgNoteEncryption } from 'orgnote-api';

export const useNoteDetailStore = defineStore('note-detail-store', () => {
  const { readTextFile, writeTextFile } = useFileSystemStore();
  const { decrypt, encrypt } = useEncryption();

  const getNoteContent = async (
    noteId: string,
    encryptionConfig?: OrgNoteEncryption
  ) => {
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
    // const encryptedContent = await encrypt(content, encryptionConfig);
    await writeTextFile(noteInfo.filePath, content, encryptionConfig);
  };

  return {
    getNoteContent,
    updateNoteContent,
  };
});
