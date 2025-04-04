import { defineStore } from 'pinia';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
  encrypt as _encrypt,
  decrypt as _decrypt,
} from 'orgnote-api/encryption';
import type {
  BaseOrgNoteDecryption,
  BaseOrgNoteEncryption,
  EncryptionStore,
  NoteInfo,
  OrgNoteEncryption,
} from 'orgnote-api';
import { armor } from 'orgnote-api';
import { useConfigStore } from './config';

export const useEncryptionStore = defineStore<'encryption', EncryptionStore>('encryption', () => {
  const { config } = useConfigStore();

  const encrypt = async (
    text: string,
    format: BaseOrgNoteEncryption['format'] = 'binary',
    encryptionConfig?: OrgNoteEncryption,
  ): Promise<string> => {
    encryptionConfig ??= config.encryption;
    return await _encrypt({
      content: text,
      format,
      ...encryptionConfig,
    });
  };

  const decrypt = async (
    content: string | Uint8Array,
    format: BaseOrgNoteDecryption['format'] = 'utf8',
    encryptionConfig?: OrgNoteEncryption,
  ): Promise<string> => {
    encryptionConfig ??= config.encryption;
    const text = typeof content === 'string' ? content : armor(content);
    return await _decrypt({
      content: text,
      format,
      ...encryptionConfig,
    });
  };

  const encryptNote = async (noteInfo: NoteInfo, noteText: string): Promise<[NoteInfo, string]> => {
    return await _encryptNote(noteInfo, {
      content: noteText,
      ...config.encryption,
    });
  };

  const decryptNote = async (
    noteInfo: NoteInfo,
    noteText: string,
  ): Promise<[NoteInfo, string | Uint8Array]> => {
    return await _decryptNote(noteInfo, {
      content: noteText,
      ...config.encryption,
    });
  };

  return {
    encrypt,
    decrypt,
    encryptNote,
    decryptNote,
  };
});
