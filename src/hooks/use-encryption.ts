import { useSettingsStore } from 'src/stores/settings';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
  encrypt as _encrypt,
  decrypt as _decrypt,
} from 'orgnote-api/encryption';
import { Note } from 'orgnote-api';

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

  const encrypt = async (text: string): Promise<string> => {
    return await _encrypt(text, config.encryption);
  };

  const decrypt = async (text: string): Promise<string> => {
    return await _decrypt(text, config.encryption);
  };

  return {
    encrypt,
    decrypt,
    encryptNote,
    decryptNote,
  };
}
