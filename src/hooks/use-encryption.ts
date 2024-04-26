import { useSettingsStore } from 'src/stores/settings';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
} from 'orgnote-api/encryption';
import { Note } from 'src/models';

export function useEncryption() {
  const { config } = useSettingsStore();

  const encryptNote = async (note: Note): Promise<Note> => {
    return await _encryptNote(note, config.encryption);
  };

  const decryptNote = async (note: Note): Promise<Note> => {
    return await _decryptNote(note, config.encryption);
  };

  return {
    encryptNote,
    decryptNote,
  };
}
