import { useSettingsStore } from 'src/stores/settings';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
  encrypt as _encrypt,
  decrypt as _decrypt,
} from 'orgnote-api/encryption';
import { Note, OrgNoteEncryption } from 'orgnote-api';

// TODO: feat/native-file-sync store cause use config
export function useEncryption() {
  const { config } = useSettingsStore();

  const encryptNote = async (
    note: Note,
    noteText: string
  ): Promise<[Note, string]> => {
    return await _encryptNote(note, noteText, config.encryption);
  };

  const decryptNote = async (
    note: Note,
    noteText: string
  ): Promise<[Note, string]> => {
    const res = await _decryptNote(note, noteText, config.encryption);
    return res;
  };

  const encrypt = async (
    text: string,
    encryptionConfig?: OrgNoteEncryption
  ): Promise<string> => {
    return await _encrypt(text, encryptionConfig ?? config.encryption);
  };

  const decrypt = async (
    text: string,
    encryptionConfig?: OrgNoteEncryption
  ): Promise<string> => {
    return await _decrypt(text, encryptionConfig ?? config.encryption);
  };

  return {
    encrypt,
    decrypt,
    encryptNote,
    decryptNote,
  };
}
