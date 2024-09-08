import { useSettingsStore } from 'src/stores/settings';
import {
  encryptNote as _encryptNote,
  decryptNote as _decryptNote,
  encrypt as _encrypt,
  decrypt as _decrypt,
} from 'orgnote-api/encryption';
import {
  BaseOrgNoteDecryption,
  BaseOrgNoteEncryption,
  Note,
  OrgNoteEncryption,
  armor,
} from 'orgnote-api';

// TODO: feat/native-file-sync store cause use config
export function useEncryption() {
  const { config } = useSettingsStore();

  const encryptNote = async (
    note: Note,
    noteText: string
  ): Promise<[Note, string]> => {
    return await _encryptNote(note, {
      content: noteText,
      ...config.encryption,
    });
  };

  const decryptNote = async (
    note: Note,
    noteText: string
  ): Promise<[Note, string]> => {
    const res = await _decryptNote(note, {
      content: noteText,
      ...config.encryption,
    });
    return res;
  };

  const encrypt = async (
    text: string,
    format: BaseOrgNoteEncryption['format'] = 'binary',
    encryptionConfig?: OrgNoteEncryption
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
    encryptionConfig?: OrgNoteEncryption
  ): Promise<string> => {
    encryptionConfig ??= config.encryption;
    console.trace(
      '✎: [line 60][use-encryption.ts] encryptionConfig: ',
      encryptionConfig,
      content
    );
    const text = typeof content === 'string' ? content : armor(content);
    return await _decrypt({
      content: text,
      format,
      ...encryptionConfig,
    });
  };

  return {
    encrypt,
    decrypt,
    encryptNote,
    decryptNote,
  };
}
